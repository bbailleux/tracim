import React from 'react'
import PropTypes from 'prop-types'
import Radium from 'radium'
import { IconButton } from 'tracim_frontend_lib'

export const DashboardButton = props =>
  <IconButton
    customClass='dashboard__workspace__rightMenu__contents__button'
    text={props.creationLabel}
    icon={props.faIcon}
    title={props.creationLabel}
    type='button'
    iconColor={props.hexcolor}
    onClick={props.onClickBtn}
    intent='secondary'
    mode='dark'
    dataCy={props.dataCy}
  />
export default Radium(DashboardButton)

DashboardButton.propTypes = {
  hexcolor: PropTypes.string.isRequired,
  faIcon: PropTypes.string.isRequired,
  creationLabel: PropTypes.string.isRequired,
  customClass: PropTypes.string,
  onClickBtn: PropTypes.func,
  dataCy: PropTypes.string
}

DashboardButton.defaultProps = {
  customClass: '',
  dataCy: ''
}
