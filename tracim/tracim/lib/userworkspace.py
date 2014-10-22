# -*- coding: utf-8 -*-

__author__ = 'damien'

import os
from datetime import datetime
from hashlib import sha256

from sqlalchemy import Table, ForeignKey, Column
from sqlalchemy.types import Unicode, Integer, DateTime, Text
from sqlalchemy.orm import relation, synonym
from sqlalchemy.orm import joinedload_all
import sqlalchemy.orm as sqlao
import sqlalchemy as sqla

import tg

from tracim.model.auth import User
from tracim.model.data import Workspace
from tracim.model.data import UserRoleInWorkspace
from tracim.model.data import RoleType

from tracim.model import auth as pbma
from tracim.model import DBSession

from tracim.model.serializers import DictLikeClass

class RoleApi(object):

    ALL_ROLE_VALUES = UserRoleInWorkspace.get_all_role_values()

    def __init__(self, current_user: User):
        self._user = current_user

    def create_role(self) -> UserRoleInWorkspace:
        role = UserRoleInWorkspace()

        return role

    def _get_one_rsc(self, user_id, workspace_id):
        """
        :param user_id:
        :param workspace_id:
        :return: a Query object, filtered query but without fetching the object.
        """
        return DBSession.query(UserRoleInWorkspace).\
            filter(UserRoleInWorkspace.workspace_id==workspace_id).\
            filter(UserRoleInWorkspace.user_id==user_id)

    def get_one(self, user_id, workspace_id):
        return self._get_one_rsc(user_id, workspace_id).one()

    def create_one(self, user: User, workspace: Workspace, role_level: int, flush: bool=True) -> UserRoleInWorkspace:
        role = self.create_role()
        role.user_id = user.user_id
        role.workspace = workspace
        role.role = role_level
        if flush:
            DBSession.flush()
        return role

    def delete_one(self, user_id, workspace_id, flush=True):
        self._get_one_rsc(user_id, workspace_id).delete()
        if flush:
            DBSession.flush()

    def _get_all_for_user(self, user_id):
        return DBSession.query(UserRoleInWorkspace).filter(UserRoleInWorkspace.user_id==user_id)

    def get_all_for_user(self, user_id):
        return self._get_all_for_user(user_id).all()

    def get_all_for_user_order_by_workspace(self, user_id: int) -> UserRoleInWorkspace:
        return self._get_all_for_user(user_id).join(UserRoleInWorkspace.workspace).order_by(Workspace.data_label).all()

    def get_all_for_workspace(self, workspace_id):
        return DBSession.query(UserRoleInWorkspace).filter(UserRoleInWorkspace.workspace_id==workspace_id).all()

    def save(self, role: UserRoleInWorkspace):
        DBSession.flush()

    def get_roles_for_select_field(self):
        """

        :return: list of DictLikeClass instances representing available Roles (to be used in select fields
        """
        result = list()

        for role_id in UserRoleInWorkspace.get_all_role_values():
            role = RoleType(role_id)
            result.append(role)

        return result

