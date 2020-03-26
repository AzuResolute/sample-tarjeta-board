import React, {Component, Fragment} from 'react'
import {NavDropdown} from 'react-bootstrap'
import {clearSessionThunk} from '../../store'
import {connect} from 'react-redux'
import BoardOptionsNav from './BoardOptionsNav'
import axios from 'axios'
import alertify from 'alertifyjs'
import Confirm from '../misc/Confirm'

class BoardNav extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isSuccessful: false
    }
  }

  confirmSuccess = () => this.setState({isSuccessful: false})

  handleSave = async () => {
    const {members, worshipService, user} = this.props
    const attendance = members.map(m => ({
      worshipserviceId: worshipService.id,
      memberId: m.id,
      localId: m.localId,
      areaGroup: m.areaGroup,
      lastName: m.lastName,
      firstName: m.firstName,
      cfo: m.cfo,
      officer: m.officer,
      gender: m.gender,
      hasAttended: m.hasAttended
    }))
    const {status} = await axios.post(
      `/api/attendance/save/${user}`,
      attendance
    )
    if (status === 200) {
      await this.props.handleClearSession()
      this.setState({isSuccessful: true})
      alertify.success('Members saved!')
    }
  }

  render() {
    const {worshipService} = this.props
    return (
      <Fragment>
        <NavDropdown title="Attendance Board" id="nav-dropdown" size="lg">
          <NavDropdown.Item eventKey="4.1" href="/home/">
            Complete
          </NavDropdown.Item>
          <NavDropdown.Item eventKey="4.2" href="/home/M">
            Male
          </NavDropdown.Item>
          <NavDropdown.Item eventKey="4.2" href="/home/F">
            Female
          </NavDropdown.Item>
          <NavDropdown.Item
            eventKey="4.4"
            disabled={worshipService.id === 0}
            onClick={this.handleSave}
          >
            Save Attendance
          </NavDropdown.Item>
          <NavDropdown.Item
            eventKey="4.5"
            href="/service/new"
            disabled={worshipService.id > 0}
          >
            New WS Attendance
          </NavDropdown.Item>
          {this.props.isSecretary ? (
            <BoardOptionsNav />
          ) : (
            <NavDropdown.Divider />
          )}
        </NavDropdown>
        <Confirm
          title="Save Success"
          message="Attendance was saved successfully"
          show={this.state.isSuccessful}
          onHide={this.confirmSuccess}
        />
      </Fragment>
    )
  }
}

const mapState = state => ({
  isSecretary: state.secretary.isSecretary,
  user: state.user.email,
  members: state.attendance.members,
  worshipService: state.attendance.worshipService
})

const mapDispatch = dispatch => ({
  handleClearSession: () => dispatch(clearSessionThunk())
})

export default connect(mapState, mapDispatch)(BoardNav)
