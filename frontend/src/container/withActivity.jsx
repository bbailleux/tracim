import React from 'react'
import { isEqual } from 'lodash'

import {
  CONTENT_TYPE,
  NUMBER_RESULTS_BY_PAGE,
  TLM_CORE_EVENT_TYPE as TLM_CET,
  TLM_ENTITY_TYPE as TLM_ET,
  TLM_SUB_TYPE as TLM_SUB,
  getComment,
  getContent,
  handleClickCopyLink,
  handleFetchResult
} from 'tracim_frontend_lib'

import {
  activityDisplayFilter,
  addMessageToActivityList,
  mergeWithActivityList,
  sortActivityList
} from '../util/activity.js'
import { FETCH_CONFIG } from '../util/helper.js'
import { getNotificationList } from '../action-creator.async.js'
import { newFlashMessage } from '../action-creator.sync.js'

const ACTIVITY_COUNT_PER_PAGE = NUMBER_RESULTS_BY_PAGE // 15
const ACTIVITY_HISTORY_COUNT = 5
const ACTIVITY_BATCH_COUNT = 5
// NOTE - SG - 2021-05-05 - empirically we noted that building an activity
// needs three messages in average.
const NOTIFICATION_COUNT_PER_REQUEST = 3 * ACTIVITY_BATCH_COUNT

const makeCancelable = (promise) => {
  let isCanceled = false
  const wrappedPromise =
    new Promise((resolve, reject) => {
      promise
        .then((val) => (isCanceled ? reject(new Error('Cancelled')) : resolve(val)))
        .catch((error) => (reject(isCanceled ? new Error('Cancelled') : error)))
    })
  return {
    promise: wrappedPromise,
    cancel: () => { isCanceled = true }
  }
}

/**
 * Higher-Order Component which factorizes the common behavior between workspace and personal
 * recent activities.
 * @param {React.Component} WrappedComponent component you want to wrap with this HOC
 * @param {function} setActivityList a redux action that will set the activity.list prop when dispatched.
 * @param {function} setActivityNextPage a redux action that will set the
 *  activity.hasNextPage/nextPageToken props when dispatched.
 * @param {function} resetActivity a redux action that resets the activity prop when dispatched.
 * @param {function} setActivityEventList a redux action that sets the event list of a given activity
 */
const withActivity = (WrappedComponent, setActivityList, setActivityNextPage, resetActivity, setActivityEventList) => {
  return class extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        showRefresh: false
      }
      this.changingActivityList = false
      this.loadActivitiesPromise = null
    }

    /**
     * Return a promise that, when awaited, will ensure that
     * no other update is taking place on props.activity.list.
     * Used in conjunction with this.changingActivityList.
     */
    waitForNoChange = () => {
      return new Promise((resolve, reject) => {
        const waitNotIsChanging = () => {
          if (!this.changingActivityList) return resolve()
          setTimeout(waitNotIsChanging, 5)
        }
        waitNotIsChanging()
      })
    }

    handleClickCopyLink = content => {
      const { props } = this
      handleClickCopyLink(content.content_type === CONTENT_TYPE.COMMENT
        ? content.parent_id
        : content.content_id
      )
      props.dispatch(newFlashMessage(props.t('The link has been copied to clipboard'), 'info'))
    }

    handleEventClick = async (activity) => {
      const { props } = this
      const messageListResponse = await props.dispatch(getNotificationList(
        props.user.userId,
        {
          notificationsPerPage: ACTIVITY_HISTORY_COUNT,
          recentActivitiesEvents: true,
          relatedContentId: activity.content.content_id,
          workspaceId: activity.content.workspace_id,
          includeNotSent: true
        }
      ))
      props.dispatch(setActivityEventList(activity.id, messageListResponse.json.items))
    }

    getContent = async (contentId) => {
      const { props } = this
      const fetchGetContent = await handleFetchResult(await getContent(FETCH_CONFIG.apiUrl, contentId))
      switch (fetchGetContent.apiResponse.status) {
        case 200: return fetchGetContent.body
        default:
          props.dispatch(newFlashMessage(props.t('Unknown content')))
          return {}
      }
    }

    /**
     * Get a complete comment
     *
     * This function exists also in appContentFactory
     * @param {int} spaceId
     * @param {int} contentId
     * @param {int} commentId
     * @returns {Promise<JSON>}
     */
    getComment = async (spaceId, contentId, commentId) => {
      const { props } = this
      const fetchGetComment = await handleFetchResult(
        await getComment(FETCH_CONFIG.apiUrl, spaceId, contentId, commentId)
      )
      switch (fetchGetComment.apiResponse.status) {
        case 200: return fetchGetComment.body
        default:
          props.dispatch(newFlashMessage(props.t('Unknown comment')))
          return {}
      }
    }

    /**
     * Update the activity list according to the TLM
     * Every operation on ActivityList from TLM should be in this function
     * @param {TLM} data
     * @returns
     */
    updateActivityListFromTlm = async (data) => {
      const { props } = this
      await this.waitForNoChange()
      this.changingActivityList = true
      let activity = data
      if (data.event_type.includes(TLM_SUB.COMMENT) ||
        (data.event_type.includes(TLM_ET.MENTION) && data.fields.content.content_type === TLM_SUB.COMMENT)
      ) {
        activity = {
          ...data,
          fields: {
            ...data.fields,
            content: {
              ...data.fields.content,
              ...await this.getComment(
                data.fields.workspace.workspace_id,
                data.fields.content.parent_id,
                data.fields.content.content_id
              )
            }
          }
        }
      } else {
        if (
          (data.event_type.includes(TLM_ET.CONTENT) && !data.event_type.includes(TLM_SUB.TODO)) ||
          data.event_type.includes(TLM_ET.MENTION)
        ) {
          activity = {
            ...data,
            fields: {
              ...data.fields,
              content: {
                ...data.fields.content,
                ...await this.getContent(data.fields.content.content_id)
              }
            }
          }
        }
      }
      const updatedActivityList = await addMessageToActivityList(
        activity, props.activity.list, FETCH_CONFIG.apiUrl
      )
      if (!isEqual(props.activity.list, updatedActivityList)) {
        props.dispatch(setActivityList(updatedActivityList))
      }
      if (data.event_type.includes(TLM_SUB.COMMENT) && !(
        data.event_type.includes(TLM_CET.MODIFIED) || data.event_type.includes(TLM_CET.DELETED)
      )) {
        const showRefresh = (
          updatedActivityList.length > 0 &&
          updatedActivityList[0].newestMessage.event_id !== data.event_id
        )
        this.setState({ showRefresh })
      }
      this.changingActivityList = false
    }

    /**
     * Sort already present activities so that the newest ones are first.
     */
    handleRefreshClicked = () => {
      const { props } = this
      const updatedActivityList = sortActivityList(props.activity.list)
      this.setState({ showRefresh: false })
      props.dispatch(setActivityList(updatedActivityList))
    }

    /**
     * DOC - SG - 2021-05-05
     * Load the given count of activities.
     * Activities are loaded & dispatched by batch to update the display quicker.
     * @param {Number} minActivityCount minimum count of new activities to load
     * @param {Boolean} resetList if true, the current list in props is reset before loading
     *  activities
     * @param {Number} workspaceId filter the messages by workspace id (useful for the workspace
     *  recent activities)
     * Wraps loadActivitiesBatch() so that the dispatches in redux can be cancelled.
     */
    loadActivities = async (minActivityCount, resetList = false, workspaceId = null) => {
      const { props } = this
      await this.waitForNoChange()
      this.changingActivityList = true
      let activityList = props.activity.list
      let hasNextPage = props.activity.hasNextPage
      let nextPageToken = props.activity.nextPageToken
      if (resetList) {
        props.dispatch(resetActivity())
        activityList = []
        hasNextPage = true
        nextPageToken = ''
      }
      while (hasNextPage && activityList.length < minActivityCount) {
        this.loadActivitiesPromise = makeCancelable(
          this.loadActivitiesBatch(
            activityList,
            hasNextPage,
            nextPageToken,
            workspaceId
          )
        )
        try {
          const activitiesParams = await this.loadActivitiesPromise.promise
          activityList = activitiesParams.activityList
          hasNextPage = activitiesParams.hasNextPage
          nextPageToken = activitiesParams.nextPageToken
          props.dispatch(setActivityList(activityList))
          props.dispatch(setActivityNextPage(hasNextPage, nextPageToken))
        } catch (e) {
          this.changingActivityList = false
          this.loadActivitiesPromise = null
          console.error(e)
          return
        }
        this.loadActivitiesPromise = null
      }
      this.changingActivityList = false
    }

    /**
     * DOC - SG - 2021-05-05
     * Load a batch of activities and merge them into the given list
     * Activities are built by calling /api/users/{user_id}/messages
     * @param {Array} activityList activity list to update
     * @param {boolean} hasNextPage are there remaining messages to load
     * @param {string} nextPageToken token to get the next page of messages
     * @param {Number} workspaceId filter the messages by workspace id (useful for the workspace
     *  recent activities)
     */
    loadActivitiesBatch = async (activityList, hasNextPage, nextPageToken, workspaceId = null) => {
      const { props } = this
      const activityListLengthGoal = activityList.length + ACTIVITY_BATCH_COUNT
      while (hasNextPage && activityList.length < activityListLengthGoal) {
        const messageListResponse = await props.dispatch(getNotificationList(
          props.user.userId,
          {
            nextPageToken: nextPageToken,
            notificationsPerPage: NOTIFICATION_COUNT_PER_REQUEST,
            recentActivitiesEvents: true,
            workspaceId: workspaceId,
            includeNotSent: true
          }
        ))
        activityList = await mergeWithActivityList(
          messageListResponse.json.items,
          activityList,
          FETCH_CONFIG.apiUrl
        )
        activityList = activityList.filter(
          (activity) => activityDisplayFilter(activity, props.workspaceList, props.user.userId)
        )
        hasNextPage = messageListResponse.json.has_next
        nextPageToken = messageListResponse.json.next_page_token
      }
      return {
        activityList,
        hasNextPage,
        nextPageToken
      }
    }

    cancelCurrentLoadActivities = () => {
      if (!this.loadActivitiesPromise) return
      this.loadActivitiesPromise.cancel()
    }

    render () {
      return (
        <WrappedComponent
          loadActivities={this.loadActivities}
          handleTlm={this.updateActivityListFromTlm}
          onRefreshClicked={this.handleRefreshClicked}
          onCopyLinkClicked={this.handleClickCopyLink}
          onEventClicked={this.handleEventClick}
          showRefresh={this.state.showRefresh}
          cancelCurrentLoadActivities={this.cancelCurrentLoadActivities}
          {...this.props}
        />
      )
    }
  }
}

export { withActivity, ACTIVITY_COUNT_PER_PAGE }
