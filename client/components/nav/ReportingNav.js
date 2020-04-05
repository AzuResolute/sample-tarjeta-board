import React, {Component} from 'react'
import {NavDropdown} from 'react-bootstrap'
import {connect} from 'react-redux'

class ReportingNav extends Component {
  handleR103request = () => {
    console.log('Selected R-103 Request')
  }

  render() {
    const {worshipService} = this.props
    return (
      <NavDropdown title="Reports" id="nav-dropdown" size="lg">
        <NavDropdown.Item
          eventKey="4.2"
          href="/reports/adhoc/period/current"
          disabled={worshipService.id === 0}
        >
          Current Service Report
        </NavDropdown.Item>
        <NavDropdown.Item eventKey="4.2" href="/reports/adhoc/form/period">
          Service Report per Reporting Period
        </NavDropdown.Item>
        <NavDropdown.Item eventKey="4.2" href="/reports/adhoc/form/week">
          Service Report per Week
        </NavDropdown.Item>
        {/* <NavDropdown.Item
          eventKey="4.3"
          disabled
          onClick={this.handleR103request}
        >
          prioritize this ----- > R-103 Preview

        </NavDropdown.Item> */}
        {/*
          Excel Export - Make it part of the ad hov report?
        */}
      </NavDropdown>
    )
  }
}

const mapState = state => ({
  worshipService: state.attendance.worshipService
})

export default connect(mapState)(ReportingNav)
