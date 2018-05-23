import typing
from pyramid.request import Request
from sqlalchemy.orm.exc import NoResultFound

from tracim.exceptions import NotAuthentificated
from tracim.exceptions import WorkspaceNotFound
from tracim.exceptions import ImmutableAttribute
from tracim.lib.core.user import UserApi
from tracim.lib.core.workspace import WorkspaceApi
from tracim.lib.utils.authorization import JSONDecodeError

from tracim.models import User
from tracim.models.data import Workspace


class TracimRequest(Request):
    """
    Request with tracim specific params/methods
    """
    def __init__(
            self,
            environ,
            charset=None,
            unicode_errors=None,
            decode_param_names=None,
            **kw
    ):
        super().__init__(
            environ,
            charset,
            unicode_errors,
            decode_param_names,
            **kw
        )
        self._current_workspace = None  # type: Workspace
        self._current_user = None  # type: User

    @property
    def current_workspace(self) -> Workspace:
        """
        Get current workspace of the request according to authentification and
        request headers (to retrieve workspace). Setted by default value the
        first time if not configured.
        :return: Workspace of the request
        """
        if self._current_workspace is None:
            self.current_workspace = get_workspace(self.current_user, self)
        return self._current_workspace

    @current_workspace.setter
    def current_workspace(self, workspace: Workspace) -> None:
        """
        Setting current_workspace
        :param workspace:
        :return:
        """
        if self._current_workspace is not None:
            raise ImmutableAttribute(
                "Can't modify already setted current_workspace"
            )
        self._current_workspace = workspace

    @property
    def current_user(self) -> User:
        if self._current_user is None:
            self.current_user = get_safe_user(self)
        return self._current_user

    @current_user.setter
    def current_user(self, user: User) -> None:
        if self._current_user is not None:
            raise ImmutableAttribute(
                "Can't modify already setted current_user"
            )
        self._current_user = user

###
# Utils for TracimRequest
###

def get_safe_user(
        request: TracimRequest,
) -> User:
    """
    Get current pyramid authenticated user from request
    :param request: pyramid request
    :return: current authenticated user
    """
    app_config = request.registry.settings['CFG']
    uapi = UserApi(None, session=request.dbsession, config=app_config)
    try:
        login = request.authenticated_userid
        if not login:
            raise NotAuthentificated('not authenticated user_id,'
                                     'Failed Authentification ?')
        user = uapi.get_one_by_email(login)
    except NoResultFound:
        raise NotAuthentificated('User not found')
    return user


def get_workspace(
        user: User,
        request: TracimRequest
) -> Workspace:
    """
    Get current workspace from request
    :param user: User who want to check the workspace
    :param request: pyramid request
    :return: current workspace
    """
    workspace_id = ''
    try:
        if 'workspace_id' in request.matchdict:
            workspace_id = request.matchdict['workspace_id']
        if not workspace_id:
            raise WorkspaceNotFound('No workspace_id param')
        wapi = WorkspaceApi(
            current_user=user,
            session=request.dbsession,
            config=request.registry.settings['CFG']
        )
        workspace = wapi.get_one(workspace_id)
    except JSONDecodeError:
        raise WorkspaceNotFound('Bad json body')
    except NoResultFound:
        raise WorkspaceNotFound(
            'Workspace {} does not exist '
            'or is not visible for this user'.format(workspace_id)
        )
    return workspace
