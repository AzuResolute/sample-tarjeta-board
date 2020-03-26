import React, {Component, Fragment} from 'react'
import {NavDropdown} from 'react-bootstrap'
import {clearSessionThunk} from '../../store'
import ConfirmWithPassword from '../misc/ConfirmWithPassword'
// import Confirm from '../misc/Confirm'
import {connect} from 'react-redux'
// import axios from 'axios'
// import alertify from 'alertifyjs'

class BoardOptionsNav extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isConfirming: false
    }
  }

  confirmClose = () => this.setState({isConfirming: false})

  render() {
    const {worshipService} = this.props
    return (
      <Fragment>
        <NavDropdown.Divider />
        <NavDropdown.Item
          eventKey="4.4"
          disabled={worshipService.id === 0}
          onClick={() => this.setState({isConfirming: true})}
        >
          Clear Attendance
        </NavDropdown.Item>
        <ConfirmWithPassword
          title="Clearing Worship Service Attendance Cache"
          message="Are you sure you want to clear? This cannot be reversed."
          secPass={true}
          show={this.state.isConfirming}
          onHide={this.confirmClose}
          buttonMessage="Clear"
          trigger={this.props.handleClearSession}
        />
      </Fragment>
    )
  }
}

const mapState = state => ({
  worshipService: state.attendance.worshipService
})

const mapDispatch = dispatch => ({
  handleClearSession: () => dispatch(clearSessionThunk())
})

export default connect(mapState, mapDispatch)(BoardOptionsNav)
