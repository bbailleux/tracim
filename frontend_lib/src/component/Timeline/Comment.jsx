import React from 'react'
import classnames from 'classnames'
import { translate } from 'react-i18next'
import Avatar, { AVATAR_SIZE } from '../Avatar/Avatar.jsx'
import HTMLContent from '../HTMLContent/HTMLContent.jsx'
import PropTypes from 'prop-types'
import { TRANSLATION_STATE } from '../../translation.js'
import TranslateButton from '../Button/TranslateButton.jsx'
import EmojiReactions from '../../container/EmojiReactions.jsx'
import DropdownMenu from '../DropdownMenu/DropdownMenu.jsx'
import Popover from '../Popover/Popover.jsx'
import IconButton from '../Button/IconButton.jsx'
import LinkPreview from '../LinkPreview/LinkPreview.jsx'
import ProfileNavigation from '../../component/ProfileNavigation/ProfileNavigation.jsx'
import {
  CONTENT_TYPE,
  ROLE,
  addExternalLinksIcons,
  displayDistanceDate,
  formatAbsoluteDate
} from '../../helper.js'

import CommentFilePreview from './CommentFilePreview.jsx'

function areCommentActionsAllowed (loggedUser, commentAuthorId) {
  return (
    loggedUser.userRoleIdInWorkspace >= ROLE.workspaceManager.id ||
    loggedUser.userId === commentAuthorId
  )
}

const Comment = (props) => {
  const firstComment = props.firstComment || props.apiContent.firstComment
  const styleSent = {
    borderColor: props.customColor
  }

  const createdFormated = formatAbsoluteDate(props.created, props.loggedUser.lang)

  const actionsAllowed = areCommentActionsAllowed(props.loggedUser, props.author.user_id)
  const readableCreationDate = formatAbsoluteDate(props.creationDate, props.loggedUser.lang, 'PPPPp')
  const createdDistance = displayDistanceDate(props.creationDate, props.loggedUser.lang)
  const isModified = props.modificationDate ? props.modificationDate !== props.creationDate : false
  const isFile = (props.apiContent.content_type || props.apiContent.type) === CONTENT_TYPE.FILE
  const isThread = (props.apiContent.content_type || props.apiContent.type) === CONTENT_TYPE.THREAD
  const isFirstCommentFile = firstComment && (firstComment.content_type || firstComment.type) === CONTENT_TYPE.FILE
  const readableModificationDate = isModified ? formatAbsoluteDate(props.modificationDate, props.loggedUser.lang, 'PPPPp') : null

  return (
    <div
      className={classnames(
        `${props.customClass}__messagelist__item`,
        'timeline_comment',
        { isTheSameDateAndAuthorThatLastComment: (props.isTheSameDateThatLastComment && props.isTheSameAuthorThatLastComment) }
      )}
    >
      {!props.isPublication && (
        <div
          className={classnames('timeline_comment__header', {
            sent: props.fromMe,
            received: !props.fromMe
          })}
        >
          <Avatar
            size={AVATAR_SIZE.MINI}
            user={props.author}
            apiUrl={props.apiUrl}
          />

          <ProfileNavigation
            user={{
              userId: props.author.user_id,
              publicName: props.author.public_name
            }}
          >
            <span>{props.author.public_name}</span>
          </ProfileNavigation>

          <div
            className='timeline_comment__header__createdDate'
            title={createdFormated}
          >
            {createdDistance}
          </div>
        </div>
      )}

      <div
        className={classnames(`${props.customClass}`, 'timeline_comment__body')}
      >
        <div className={classnames(`${props.customClass}__body__content`, 'timeline_comment__body__content')}>
          <div className='timeline_comment__body__content__textAndPreview'>
            <div
              className='timeline_comment__body__content__text'
            >
              <div
                className={classnames(`${props.customClass}__body__content__text`, 'timeline_comment__body__content__text')}
                data-cy='timeline_comment__body__content__text'
              >
                {(isFile || (isThread && isFirstCommentFile)
                  ? (
                    <CommentFilePreview
                      apiUrl={props.apiUrl}
                      apiContent={isFile ? props.apiContent : props.apiContent.firstComment}
                      isPublication={props.isPublication}
                    />
                  ) : (
                    <HTMLContent isTranslated={props.translationState === TRANSLATION_STATE.TRANSLATED}>
                      {addExternalLinksIcons(props.text)}
                    </HTMLContent>
                  )
                )}
              </div>
            </div>
            <LinkPreview apiUrl={props.apiUrl} findLinkInHTML={props.text} />
          </div>
          {!props.isPublication && (isFile || actionsAllowed) && (
            <DropdownMenu
              buttonCustomClass='timeline_comment__body__content__header__actions'
              buttonIcon='fas fa-ellipsis-v'
              buttonTooltip={props.t('Actions')}
            >
              {(isFile
                ? (
                  <IconButton
                    icon='fas fa-paperclip'
                    intent='link'
                    key='openFileComment'
                    mode='dark'
                    onClick={props.onClickOpenFileComment}
                    text={props.t('Open as content')}
                    textMobile={props.t('Open as content')}
                  />
                )
                : (
                  <IconButton
                    icon='fas fa-fw fa-pencil-alt'
                    intent='link'
                    key='editComment'
                    mode='dark'
                    onClick={props.onClickEditComment}
                    text={props.t('Edit')}
                    title={props.t('Edit comment')}
                    textMobile={props.t('Edit comment')}
                  />
                )
              )}

              {(actionsAllowed &&
                <IconButton
                  icon='far fa-fw fa-trash-alt'
                  intent='link'
                  key='deleteComment'
                  mode='dark'
                  onClick={props.onClickDeleteComment}
                  text={props.t('Delete')}
                  title={props.t('Delete comment')}
                  textMobile={props.t('Delete comment')}
                />
              )}
            </DropdownMenu>
          )}
        </div>
        <div
          className={classnames(`${props.customClass}__footer`, 'timeline__comment__footer')}
        >
          {!isFile && (
            <TranslateButton
              translationState={props.translationState}
              onClickTranslate={props.onClickTranslate}
              onClickRestore={props.onClickRestore}
              onChangeTargetLanguageCode={props.onChangeTranslationTargetLanguageCode}
              targetLanguageCode={props.translationTargetLanguageCode}
              targetLanguageList={props.translationTargetLanguageList}
              dataCy='timeline_commentTranslateButton'
            />
          )}
          <EmojiReactions
            apiUrl={props.apiUrl}
            loggedUser={props.loggedUser}
            contentId={props.contentId}
            workspaceId={props.workspaceId}
          />

          {props.isPublication && props.showCommentList && (
            <IconButton
              text={props.discussionToggleButtonLabel}
              textMobile={props.threadLength > 0 ? props.threadLength.toString() : ''}
              icon='far fa-comment'
              onClick={props.onClickToggleCommentList}
              customClass='buttonComments'
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default translate()(Comment)

Comment.propTypes = {
  apiContent: PropTypes.object.isRequired,
  firstComment: PropTypes.object,
  author: PropTypes.object.isRequired,
  contentId: PropTypes.number.isRequired,
  isPublication: PropTypes.bool.isRequired,
  loggedUser: PropTypes.object.isRequired,
  onChangeTranslationTargetLanguageCode: PropTypes.func.isRequired,
  translationTargetLanguageCode: PropTypes.string.isRequired,
  translationTargetLanguageList: PropTypes.arrayOf(PropTypes.object).isRequired,
  workspaceId: PropTypes.number.isRequired,
  creationDate: PropTypes.string,
  customClass: PropTypes.string,
  customColor: PropTypes.string,
  isTheSameAuthorThatLastComment: PropTypes.bool,
  isTheSameDateThatLastComment: PropTypes.bool,
  text: PropTypes.string,
  created: PropTypes.string.isRequired,
  discussionToggleButtonLabel: PropTypes.string,
  fromMe: PropTypes.bool,
  modificationDate: PropTypes.string,
  onClickDeleteComment: PropTypes.func,
  onClickEditComment: PropTypes.func,
  onClickOpenFileComment: PropTypes.func,
  onClickRestore: PropTypes.func.isRequired,
  onClickToggleCommentList: PropTypes.func,
  onClickTranslate: PropTypes.func.isRequired,
  text: PropTypes.string,
  threadLength: PropTypes.number,
  translationState: PropTypes.oneOf(Object.values(TRANSLATION_STATE))
}

Comment.defaultProps = {
  creationDate: '',
  customClass: '',
  customColor: 'transparent',
  isTheSameAuthorThatLastComment: false,
  isTheSameDateThatLastComment: false,
  fromMe: false,
  discussionToggleButtonLabel: 'timeline_comment',
  onClickEditComment: () => { },
  onClickOpenFileComment: () => { },
  onClickDeleteComment: () => { },
  modificationDate: '',
  text: '',
  threadLength: 0,
  translationState: TRANSLATION_STATE.DISABLED
}
