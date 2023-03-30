import {
  ADD,
  REMOVE,
  SET,
  UPDATE,
  USER_WORKSPACE_EMAIL_NOTIFICATION_TYPE,
  WORKSPACE_LIST,
  WORKSPACE_LIST_MEMBER,
  WORKSPACE_MEMBER,
  WORKSPACE_DETAIL
} from '../action-creator.sync.js'
import { serialize, sortListByMultipleCriteria, SORT_BY, SORT_ORDER } from 'tracim_frontend_lib'
import { serializeSidebarEntryProps, serializeMember } from './currentWorkspace.js'
import { uniqBy } from 'lodash'

export const serializeWorkspaceListProps = {
  access_type: 'accessType',
  agenda_enabled: 'agendaEnabled',
  default_user_role: 'defaultRole',
  description: 'description',
  public_download_enabled: 'downloadEnabled',
  workspace_id: 'id',
  is_deleted: 'isDeleted',
  label: 'label',
  parent_id: 'parentId',
  publication_enabled: 'publicationEnabled',
  sidebar_entries: 'sidebarEntryList',
  slug: 'slug',
  public_upload_enabled: 'uploadEnabled',
  memberList: 'memberList'
}

const serializeWorkspace = workspace => {
  return {
    ...serialize(workspace, serializeWorkspaceListProps),
    sidebarEntryList: workspace.sidebar_entries.map(sbe => serialize(sbe, serializeSidebarEntryProps)),
    memberList: workspace.members.map(serializeMember)
  }
}

export function workspaceList (state = [], action, lang) {
  switch (action.type) {
    case `${SET}/${WORKSPACE_LIST}`:
      return action.workspaceList.map(serializeWorkspace)

    case `${ADD}/${WORKSPACE_LIST}`: {
      const spaceList = [
        ...state,
        ...action.workspaceList
          .filter(w => !state.some(s => s.id === w.workspace_id))
          .map(serializeWorkspace)
      ]
      return sortListByMultipleCriteria(spaceList, [SORT_BY.LABEL, SORT_BY.ID], SORT_ORDER.ASCENDING, lang)
    }

    case `${REMOVE}/${WORKSPACE_LIST}`:
      return state.filter(ws => ws.id !== action.workspace.workspace_id)

    case `${SET}/${WORKSPACE_LIST_MEMBER}`:
      return state.map(ws => ({
        ...ws,
        memberList: action.workspaceListMemberList.find(wlml => wlml.workspaceId === ws.id).memberList.map(m => (serializeMember(m)))
      }))

    case `${UPDATE}/${USER_WORKSPACE_EMAIL_NOTIFICATION_TYPE}`:
      return state.map(ws => ws.id === action.workspaceId
        ? {
          ...ws,
          memberList: ws.memberList.map(u => u.id === action.userId
            ? { ...u, emailNotificationType: action.emailNotificationType }
            : u
          )
        }
        : ws
      )

    case `${ADD}/${WORKSPACE_MEMBER}`:
      if (!state.some(ws => ws.id === action.workspaceId)) return state
      return state.map(ws => ws.id === action.workspaceId
        ? {
          ...ws,
          memberList: uniqBy([
            ...ws.memberList,
            serializeMember(action.newMember)
          ], 'id')
        }
        : ws
      )

    case `${UPDATE}/${WORKSPACE_MEMBER}`:
      if (!state.some(ws => ws.id === action.workspaceId)) return state
      return state.map(ws => ws.id === action.workspaceId
        ? {
          ...ws,
          memberList: ws.memberList.map(m => m.id === action.member.user.user_id
            ? { ...m, ...serializeMember(action.member) }
            : m
          )
        }
        : ws
      )

    case `${REMOVE}/${WORKSPACE_MEMBER}`:
      if (!state.some(ws => ws.id === action.workspaceId)) return state
      return state.map(ws => ws.id === action.workspaceId
        ? {
          ...ws,
          memberList: ws.memberList.filter(m => m.id !== action.memberId)
        }
        : ws
      )

    case `${UPDATE}/${WORKSPACE_DETAIL}`: {
      if (!state.some(ws => ws.id === action.workspaceDetail.workspace_id)) return state
      const spaceList = state.map(
        ws => ws.id === action.workspaceDetail.workspace_id
          ? serializeWorkspace(action.workspaceDetail)
          : ws
      )
      return sortListByMultipleCriteria(spaceList, [SORT_BY.LABEL, SORT_BY.ID], SORT_ORDER.ASCENDING, lang)
    }

    default:
      return state
  }
}

export default workspaceList
