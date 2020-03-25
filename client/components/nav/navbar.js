import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
  logout,
  updateSecretaryModeThunk,
  getAccessFromSessionThunk,
  importFromSessionThunk
} from '../../store'
import {
  Navbar as NavBarComp,
  Nav,
  Alert,
  OverlayTrigger,
  Popover
} from 'react-bootstrap'
import PasswordRequest from '../misc/PasswordRequest'
import BoardNav from './BoardNav'
import ReportingNav from './ReportingNav'
import Initialize from '../misc/Initialize'
import ControlNav from './ControlNav'
const {secretaryPass} = require('../../../secrets')
const secPass = process.env.secretaryPass || secretaryPass

class Navbar extends Component {
  toggleSecMode = () => {
    this.props.handleUpdateSecretaryMode()
  }

  handlePasswordChange = e => {
    if (secPass === e.target.value) {
      this.props.handleUpdateSecretaryMode()
    }
  }

  reverseTimeZoneAccounted = date => {
    return new Date(
      new Date(date).getTime() +
        new Date(Date.now()).getTimezoneOffset() * 60000
    )
  }

  renderServiceDateTime = () => {
    const {reportingPeriod, worshipService} = this.props
    const {dateTime} = worshipService
    return (
      <h5>
        {reportingPeriod.id === 0
          ? 'Please set Worship Service time'
          : new Date(
              this.reverseTimeZoneAccounted(dateTime)
            ).toLocaleTimeString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
      </h5>
    )
  }

  render() {
    const {
      handleClick,
      isLoggedIn,
      worshipService,
      isSecretary,
      locals
    } = this.props

    if (!isLoggedIn) {
      return (
        <div>
          <NavBarComp bg="dark" variant="dark">
            <Nav
              className="d-flex justify-content-center flex-wrap w-100"
              activeKey="/home"
            >
              <h3 className="text-info">Tarjeta Board Application</h3>
            </Nav>
          </NavBarComp>
          <hr />
        </div>
      )
    }

    return !worshipService || locals.length === 0 ? (
      <Initialize />
    ) : (
      <div>
        <NavBarComp bg="dark" variant="dark" className="position-sticky">
          <Nav
            className="d-flex justify-content-center flex-wrap w-100"
            activeKey="/home"
          >
            <Nav.Item className="align-self-center text-success d-flex align-items-center flex-column">
              <h3>Worship Service:</h3>
              {this.renderServiceDateTime()}
            </Nav.Item>
            <BoardNav />
            {isSecretary ? (
              <Fragment>
                <ReportingNav />
                <ControlNav />
                <Nav.Item>
                  <Nav.Link href="#" onClick={handleClick}>
                    Logout
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link onClick={this.toggleSecMode}>
                    Enter WS Mode
                  </Nav.Link>
                </Nav.Item>
              </Fragment>
            ) : (
              <OverlayTrigger
                trigger="click"
                key="bottom"
                placement="bottom"
                overlay={
                  <Popover>
                    <Popover.Content>
                      <PasswordRequest
                        handlePasswordChange={this.handlePasswordChange}
                      />
                    </Popover.Content>
                  </Popover>
                }
              >
                <Nav.Item>
                  <Nav.Link>Enter Secretary Mode</Nav.Link>
                </Nav.Item>
              </OverlayTrigger>
            )}
            <Nav.Item className="d-flex align-items-center">
              <Alert
                style={{marginBottom: 0}}
                variant={isSecretary ? 'danger' : 'info'}
                className="align-middle"
              >
                {isSecretary ? 'SECRETARY MODE' : 'Worship Service Mode'}
              </Alert>
            </Nav.Item>
          </Nav>
        </NavBarComp>
        <hr />
      </div>
    )
  }
}

const mapState = state => ({
  isLoggedIn: !!state.user.id,
  worshipService: state.attendance.worshipService,
  locals: state.local.locals,
  isSecretary: state.secretary.isSecretary,
  reportingPeriod: state.attendance.reportingPeriod
})

const mapDispatch = dispatch => ({
  handleClick: () => dispatch(logout()),
  handleUpdateSecretaryMode: () => dispatch(updateSecretaryModeThunk()),
  fetchAccessFromSession: () => dispatch(getAccessFromSessionThunk()),
  fetchMembersFromSession: () => dispatch(importFromSessionThunk())
})

export default connect(mapState, mapDispatch)(Navbar)

Navbar.propTypes = {
  handleClick: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired
}
