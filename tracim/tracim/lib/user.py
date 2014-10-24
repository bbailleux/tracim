# -*- coding: utf-8 -*-

__author__ = 'damien'

import tg

from tracim.model.auth import User

from tracim.model import auth as pbma
from tracim.model import DBSession
import tracim.model.data as pmd

class UserApi(object):

    def __init__(self, current_user: User):
        self._user = current_user

    def get_all(self):
        return DBSession.query(User).order_by(User.display_name).all()

    def _base_query(self):
        return DBSession.query(User)

    def get_one(self, user_id: int):
        return self._base_query().filter(User.user_id==user_id).one()

    def get_one_by_email(self, email: str):
        return self._base_query().filter(User.email==email).one()

    def update(self, user: User, name: str, email: str, do_save):
        user.display_name = name
        user.email = email
        if do_save:
            self.save(user)

        if user.user_id==self._user.user_id:
            # this is required for the session to keep on being up-to-date
            tg.request.identity['repoze.who.userid'] = email

    def user_with_email_exists(self, email: str):
        try:
            self.get_one_by_email(email)
            return True
        except:
            return False

    def create_user(self, save_now=False) -> User:
        user = User()
        DBSession.add(user)
        if save_now:
            DBSession.flush()

        return user

    def save(self, user: User):
        DBSession.flush()


class UserStaticApi(object):

  @classmethod
  def get_current_user(cls) -> User:
    identity = tg.request.identity

    if tg.request.identity:
        return pbma.User.by_email_address(tg.request.identity['repoze.who.userid'])
    return None
