# coding: utf-8
from configparser import ConfigParser
import logging
import os
import typing

from radicale.config import load as load_radicale_config

from tracim_backend.config import CFG
from tracim_backend.exceptions import ConfigurationError
from tracim_backend.lib.utils.logger import logger

RADICALE_MAIN_SECTION = "caldav"
RADICALE_SUBMAIN_SECTION = "radicale"


class CaldavAppFactory(object):
    def __init__(self, **settings):
        logger.info(self, "Add additional radicale config")
        self.radicale_config = load_radicale_config(())
        self.radicale_config = self._parse_additional_radicale_config(
            self.radicale_config, settings
        )
        self.app_config = CFG(settings)
        self.create_dir_tree(self.radicale_config, self.app_config)

    def create_dir_tree(self, radicale_config: ConfigParser, app_config: CFG):
        # FIXME - G.M - 2019-03-08 - create dir tree if not exist in order
        # to allow item creation without trouble in radicale
        storage_path = radicale_config.get("storage", "filesystem_folder")
        sub_dir_storage_path = os.path.join(storage_path, "collection-root")
        parent_folder = os.path.dirname(storage_path)
        if not os.path.isdir(parent_folder):
            raise ConfigurationError(
                "{} is not a correct folder, can't set properly storage folder of radicale".format(
                    parent_folder
                )
            )
        user_dir = os.path.join(
            sub_dir_storage_path,
            app_config.CALDAV__RADICALE__AGENDA_DIR,
            app_config.CALDAV__RADICALE__USER_SUBDIR,
        )
        os.makedirs(user_dir, exist_ok=True)
        workspace_dir = os.path.join(
            sub_dir_storage_path,
            app_config.CALDAV__RADICALE__AGENDA_DIR,
            app_config.CALDAV__RADICALE__WORKSPACE_SUBDIR,
        )
        os.makedirs(workspace_dir, exist_ok=True)

    def _sliced_dict(self, data: typing.Dict[str, any], beginning_key_string: str):
        """
        Get dict of all item beginning with beginning_key_string
        :param data:
        :param beginning_key_string:
        :return:
        """
        sliced_dict = {}
        for key, value in data.items():
            if key.startswith(beginning_key_string):
                sliced_dict[key] = value
        return sliced_dict

    def _parse_additional_radicale_config(
        self, config: ConfigParser, settings: dict
    ) -> ConfigParser:
        """
        Add settings params beginning with
        "RADICALE_MAIN_SECTION.RADICALE_SUBMAIN_SECTION." to radicale config.
        """
        radicales_params = self._sliced_dict(
            data=settings,
            beginning_key_string="{}.{}.".format(RADICALE_MAIN_SECTION, RADICALE_SUBMAIN_SECTION),
        )
        for param_name, value in radicales_params.items():
            parameter_parts = param_name.split(".")
            assert len(parameter_parts) == 4
            main_section, sub_main_section, radicale_section, radicale_param_config = (
                parameter_parts
            )
            assert main_section == "caldav"
            assert sub_main_section == "radicale"
            if not config.has_section(radicale_section):
                config.add_section(radicale_section)
            logger.debug(self, "Override radicale config: {} : {}".format(param_name, value))
            config.set(radicale_section, radicale_param_config, value)
        return config

    def get_wsgi_app(self):
        logger = logging.getLogger("radicale")

        from radicale import Application as RadicaleApplication

        return RadicaleApplication(self.radicale_config, logger)