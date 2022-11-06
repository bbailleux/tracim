import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { translate } from 'react-i18next'
import { TRANSLATION_STATE } from '../../translation.js'
import Avatar, { AVATAR_SIZE } from '../Avatar/Avatar.jsx'
import CommentFilePreview from './CommentFilePreview.jsx'
import DropdownMenu from '../DropdownMenu/DropdownMenu.jsx'
import EmojiReactions from '../../container/EmojiReactions.jsx'
import HTMLContent from '../HTMLContent/HTMLContent.jsx'
import IconButton from '../Button/IconButton.jsx'
import LinkPreview from '../LinkPreview/LinkPreview.jsx'
import Popover from '../Popover/Popover.jsx'
import ProfileNavigation from '../../component/ProfileNavigation/ProfileNavigation.jsx'
import TranslateButton from '../Button/TranslateButton.jsx'
import {
  addExternalLinksIcons,
  CONTENT_TYPE,
  displayDistanceDate,
  formatAbsoluteDate,
  ROLE
} from '../../helper.js'

function areCommentActionsAllowed (loggedUser, commentAuthorId) {
  return (
    loggedUser.userRoleIdInWorkspace >= ROLE.workspaceManager.id ||
    loggedUser.userId === commentAuthorId
  )
}

const Comment = (props) => {
  const firstComment = props.firstComment || props.apiContent.firstComment

  const actionsAllowed = areCommentActionsAllowed(props.loggedUser, props.author.user_id)
  const createdDistance = displayDistanceDate(props.creationDate, props.loggedUser.lang)

  const isModified = props.modificationDate ? props.modificationDate !== props.creationDate : false
  const isFile = (props.apiContent.content_type || props.apiContent.type) === CONTENT_TYPE.FILE
  const isThread = (props.apiContent.content_type || props.apiContent.type) === CONTENT_TYPE.THREAD
  const isFirstCommentFile = firstComment && (firstComment.content_type || firstComment.type) === CONTENT_TYPE.FILE

  const readableCreationDate = formatAbsoluteDate(props.creationDate, props.loggedUser.lang, 'PPPPp')
  const readableModificationDate = isModified ? formatAbsoluteDate(props.modificationDate, props.loggedUser.lang, 'PPPPp') : null

  return (
    <div
      className={classnames(
        `${props.customClass}__messagelist__item`,
        'timeline__comment',
        { isTheSameDateAndAuthorThatLastComment: (props.isTheSameDateThatLastComment && props.isTheSameAuthorThatLastComment) }
      )}
    >
      {!props.isNews && (
        <div
          className={classnames('timeline__comment__header', {
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
            className='timeline__comment__header__createdDate'
          >
            <span id={`createdDistance_${props.contentId}`}>
              {createdDistance}
            </span>
            <Popover
              targetId={`createdDistance_${props.contentId}`}
              popoverBody={readableCreationDate}
            />
          </div>
        </div>
      )}

      <div
        className={classnames(`${props.customClass}`, 'timeline__comment__body')}
      >
        <div className={classnames(`${props.customClass}__body__content`, 'timeline__comment__body__content')}>
          <div className='timeline__comment__body__content__textAndPreview'>
            <div
              className='timeline__comment__body__content__text'
            >
              <div
                className={classnames(`${props.customClass}__body__content__text`, 'timeline__comment__body__content__text')}
                data-cy='timeline__comment__body__content__text'
              >
                {(isFile || (isThread && isFirstCommentFile)
                  ? (
                    <CommentFilePreview
                      apiUrl={props.apiUrl}
                      apiContent={isFile ? props.apiContent : props.apiContent.firstComment}
                      isNews={props.isNews}
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

          <div className='timeline__comment__body__content__header'>
            {isModified && (
              <>
                <span
                  className='timeline__comment__body__content__header__modified'
                  id={`modificationDate_${props.contentId}`}
                >
                  ({props.t('modified')})
                </span>
                <Popover
                  targetId={`modificationDate_${props.contentId}`}
                  popoverBody={readableModificationDate}
                />
              </>
            )}

            {!props.isNews && (isFile || actionsAllowed) && (
              <DropdownMenu
                buttonCustomClass='timeline__comment__body__content__header__actions'
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
              dataCy='timeline__commentTranslateButton'
            />
          )}

          <EmojiReactions
            apiUrl={props.apiUrl}
            loggedUser={props.loggedUser}
            contentId={props.contentId}
            workspaceId={props.workspaceId}
          />

          {props.isNews && props.showCommentList && (
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
  author: PropTypes.object.isRequired,
  contentId: PropTypes.number.isRequired,
  created: PropTypes.string.isRequired,
  isNews: PropTypes.bool.isRequired,
  loggedUser: PropTypes.object.isRequired,
  onChangeTranslationTargetLanguageCode: PropTypes.func.isRequired,
  onClickRestore: PropTypes.func.isRequired,
  onClickTranslate: PropTypes.func.isRequired,
  translationTargetLanguageCode: PropTypes.string.isRequired,
  translationTargetLanguageList: PropTypes.arrayOf(PropTypes.object).isRequired,
  workspaceId: PropTypes.number.isRequired,
  creationDate: PropTypes.string,
  customClass: PropTypes.string,
  discussionToggleButtonLabel: PropTypes.string,
  firstComment: PropTypes.object,
  fromMe: PropTypes.bool,
  isTheSameAuthorThatLastComment: PropTypes.bool,
  isTheSameDateThatLastComment: PropTypes.bool,
  modificationDate: PropTypes.string,
  onClickDeleteComment: PropTypes.func,
  onClickEditComment: PropTypes.func,
  onClickOpenFileComment: PropTypes.func,
  onClickToggleCommentList: PropTypes.func,
  text: PropTypes.string,
  threadLength: PropTypes.number,
  translationState: PropTypes.oneOf(Object.values(TRANSLATION_STATE))
}

Comment.defaultProps = {
  creationDate: '',
  customClass: '',
  discussionToggleButtonLabel: 'Comment',
  fromMe: false,
  isTheSameAuthorThatLastComment: false,
  isTheSameDateThatLastComment: false,
  modificationDate: '',
  onClickDeleteComment: () => { },
  onClickEditComment: () => { },
  onClickOpenFileComment: () => { },
  onClickToggleCommentList: () => { },
  text: '',
  threadLength: 0,
  translationState: TRANSLATION_STATE.DISABLED
}
