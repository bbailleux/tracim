# -*- coding: utf-8 -*-
"""
Tests for /api/v2/workspaces subpath endpoints.
"""
from tracim.tests import FunctionalTest
from tracim.fixtures.content import Content as ContentFixtures
from tracim.fixtures.users_and_groups import Base as BaseFixture


class TestWorkspaceEndpoint(FunctionalTest):
    """
    Tests for /api/v2/workspaces/{workspace_id} endpoint
    """

    fixtures = [BaseFixture, ContentFixtures]

    def test_api__get_workspace__ok_200__nominal_case(self) -> None:
        """
        Check obtain workspace reachable for user.
        """
        self.testapp.authorization = (
            'Basic',
            (
                'admin@admin.admin',
                'admin@admin.admin'
            )
        )
        res = self.testapp.get('/api/v2/workspaces/1', status=200)
        workspace = res.json_body
        assert workspace['id'] == 1
        assert workspace['slug'] == 'w1'
        assert workspace['label'] == 'w1'
        assert workspace['description'] == 'This is a workspace'
        assert len(workspace['sidebar_entries']) == 7

        sidebar_entry = workspace['sidebar_entries'][0]
        assert sidebar_entry['slug'] == 'dashboard'
        assert sidebar_entry['label'] == 'Dashboard'
        assert sidebar_entry['route'] == '/#/workspaces/1/dashboard'  # nopep8
        assert sidebar_entry['hexcolor'] == "#252525"
        assert sidebar_entry['fa_icon'] == ""

        sidebar_entry = workspace['sidebar_entries'][1]
        assert sidebar_entry['slug'] == 'contents/all'
        assert sidebar_entry['label'] == 'All Contents'
        assert sidebar_entry['route'] == "/#/workspaces/1/contents"  # nopep8
        assert sidebar_entry['hexcolor'] == "#fdfdfd"
        assert sidebar_entry['fa_icon'] == ""

        sidebar_entry = workspace['sidebar_entries'][2]
        assert sidebar_entry['slug'] == 'contents/htmlpage'
        assert sidebar_entry['label'] == 'Text Documents'
        assert sidebar_entry['route'] == '/#/workspaces/1/contents?type=htmlpage'  # nopep8
        assert sidebar_entry['hexcolor'] == "#3f52e3"
        assert sidebar_entry['fa_icon'] == "file-text-o"

        sidebar_entry = workspace['sidebar_entries'][3]
        assert sidebar_entry['slug'] == 'contents/markdownpluspage'
        assert sidebar_entry['label'] == 'Markdown Plus Documents'
        assert sidebar_entry['route'] == "/#/workspaces/1/contents?type=markdownpluspage"    # nopep8
        assert sidebar_entry['hexcolor'] == "#f12d2d"
        assert sidebar_entry['fa_icon'] == "file-code"

        sidebar_entry = workspace['sidebar_entries'][4]
        assert sidebar_entry['slug'] == 'contents/files'
        assert sidebar_entry['label'] == 'Files'
        assert sidebar_entry['route'] == "/#/workspaces/1/contents?type=file"  # nopep8
        assert sidebar_entry['hexcolor'] == "#FF9900"
        assert sidebar_entry['fa_icon'] == "paperclip"

        sidebar_entry = workspace['sidebar_entries'][5]
        assert sidebar_entry['slug'] == 'contents/threads'
        assert sidebar_entry['label'] == 'Threads'
        assert sidebar_entry['route'] == "/#/workspaces/1/contents?type=thread"  # nopep8
        assert sidebar_entry['hexcolor'] == "#ad4cf9"
        assert sidebar_entry['fa_icon'] == "comments-o"

        sidebar_entry = workspace['sidebar_entries'][6]
        assert sidebar_entry['slug'] == 'calendar'
        assert sidebar_entry['label'] == 'Calendar'
        assert sidebar_entry['route'] == "/#/workspaces/1/calendar"  # nopep8
        assert sidebar_entry['hexcolor'] == "#757575"
        assert sidebar_entry['fa_icon'] == "calendar-alt"

    def test_api__get_workspace__err_403__unallowed_user(self) -> None:
        """
        Check obtain workspace unreachable for user
        """
        self.testapp.authorization = (
            'Basic',
            (
                'lawrence-not-real-email@fsf.local',
                'foobarbaz'
            )
        )
        res = self.testapp.get('/api/v2/workspaces/1', status=403)
        assert isinstance(res.json, dict)
        assert 'code' in res.json.keys()
        assert 'message' in res.json.keys()
        assert 'details' in res.json.keys()

    def test_api__get_workspace__err_401__unregistered_user(self) -> None:
        """
        Check obtain workspace without registered user.
        """
        self.testapp.authorization = (
            'Basic',
            (
                'john@doe.doe',
                'lapin'
            )
        )
        res = self.testapp.get('/api/v2/workspaces/1', status=401)
        assert isinstance(res.json, dict)
        assert 'code' in res.json.keys()
        assert 'message' in res.json.keys()
        assert 'details' in res.json.keys()

    def test_api__get_workspace__err_403__workspace_does_not_exist(self) -> None:  # nopep8
        """
        Check obtain workspace who does not exist with an existing user.
        """
        self.testapp.authorization = (
            'Basic',
            (
                'admin@admin.admin',
                'admin@admin.admin'
            )
        )
        res = self.testapp.get('/api/v2/workspaces/5', status=403)
        assert isinstance(res.json, dict)
        assert 'code' in res.json.keys()
        assert 'message' in res.json.keys()
        assert 'details' in res.json.keys()


class TestWorkspaceMembersEndpoint(FunctionalTest):
    """
    Tests for /api/v2/workspaces/{workspace_id}/members endpoint
    """

    fixtures = [BaseFixture, ContentFixtures]

    def test_api__get_workspace_members__ok_200__nominal_case(self):
        """
        Check obtain workspace members list with a reachable workspace for user
        """
        self.testapp.authorization = (
            'Basic',
            (
                'admin@admin.admin',
                'admin@admin.admin'
            )
        )
        res = self.testapp.get('/api/v2/workspaces/1/members', status=200).json_body   # nopep8
        assert len(res) == 2
        user_role = res[0]
        assert user_role['role_slug'] == 'workspace_manager'
        assert user_role['role_id'] == 8
        assert user_role['user_id'] == 1
        assert user_role['workspace_id'] == 1
        assert user_role['user']['display_name'] == 'Global manager'
        # TODO - G.M - 24-05-2018 - [Avatar] Replace
        # by correct value when avatar feature will be enabled
        assert user_role['user']['avatar_url'] is None

    def test_api__get_workspace_members__err_403__unallowed_user(self):
        """
        Check obtain workspace members list with an unreachable workspace for
        user
        """
        self.testapp.authorization = (
            'Basic',
            (
                'lawrence-not-real-email@fsf.local',
                'foobarbaz'
            )
        )
        res = self.testapp.get('/api/v2/workspaces/3/members', status=403)
        assert isinstance(res.json, dict)
        assert 'code' in res.json.keys()
        assert 'message' in res.json.keys()
        assert 'details' in res.json.keys()

    def test_api__get_workspace_members__err_401__unregistered_user(self):
        """
        Check obtain workspace members list with an unregistered user
        """
        self.testapp.authorization = (
            'Basic',
            (
                'john@doe.doe',
                'lapin'
            )
        )
        res = self.testapp.get('/api/v2/workspaces/1/members', status=401)
        assert isinstance(res.json, dict)
        assert 'code' in res.json.keys()
        assert 'message' in res.json.keys()
        assert 'details' in res.json.keys()

    def test_api__get_workspace_members__err_403__workspace_does_not_exist(self):  # nopep8
        """
        Check obtain workspace members list with an existing user but
        an unexisting workspace
        """
        self.testapp.authorization = (
            'Basic',
            (
                'admin@admin.admin',
                'admin@admin.admin'
            )
        )
        res = self.testapp.get('/api/v2/workspaces/5/members', status=403)
        assert isinstance(res.json, dict)
        assert 'code' in res.json.keys()
        assert 'message' in res.json.keys()
        assert 'details' in res.json.keys()
