import React, {Component, Fragment} from 'react'
import {Button, Form, Container, Row} from 'react-bootstrap'
import {createReportingPeriodThunk} from '../../store'
import {GetWeekNumber, GetServiceFromScheduleDay} from '../../utils/attendance'
import {connect} from 'react-redux'
import axios from 'axios'
import moment from 'moment'
import alertify from 'alertifyjs'

class WorshipServiceForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedWeekNumber: GetWeekNumber(
        new Date(
          new Date(Date.now()).getTime() +
            new Date(Date.now()).getTimezoneOffset() * 60000
        )
      ),
      selectedLocal: 'MANNYUS',
      selectedDateTime: '',
      selectedServiceType: '',
      selectedCustomType: 'Special'
    }
  }

  componentDidMount = () => {
    if (this.props.members.filter(m => m.hasAttended).length > 0) {
      setTimeout(() => history.back(), 5000)
    }
  }

  handleSubmit = async e => {
    e.preventDefault()

    if (
      this.props.members.reduce((accum, m) => m.hasAttended || accum, false)
    ) {
      alertify.error('A Worship Service is currently active')
    } else {
      const {
        selectedLocal,
        selectedWeekNumber,
        selectedDateTime,
        selectedServiceType,
        selectedCustomType
      } = this.state

      const serviceType =
        selectedServiceType === 'Custom'
          ? selectedCustomType
          : selectedServiceType

      const dataToSend = {
        localId: selectedLocal,
        weekNumber: selectedWeekNumber,
        dateTime: selectedDateTime,
        serviceType
      }

      const {data} = await axios.get(
        `/api/ws/${selectedLocal}/${selectedWeekNumber}/${serviceType}/${selectedDateTime}`
      )

      let serviceAttendanceExists = !!data
      if (serviceAttendanceExists) {
        serviceAttendanceExists = !(data.attendances.length === 0)
      }

      if (serviceAttendanceExists) {
        alertify.error('An attendance for this service already exists')
      } else {
        await this.props.fetchCreateReportingPeriod(dataToSend)
      }
    }
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleDateTimeSelection = e => {
    if (Number(e.target.value) >= 0) {
      const selectedWeekNumber = GetWeekNumber(
        new Date(
          new Date(Date.now()).getTime() +
            new Date(Date.now()).getTimezoneOffset() * 60000 +
            (moment().isDST() ? 1000 * 60 * 60 : 0)
        )
      )
      const local = this.props.locals.find(
        l => l.id === this.state.selectedLocal
      )
      const sched = local.schedules.find(s => s.id === Number(e.target.value))
      const selectedDateTime = GetServiceFromScheduleDay(sched.time, sched.day)
      this.setState({
        selectedWeekNumber,
        selectedDateTime,
        selectedServiceType: sched.serviceType
      })
    }
  }

  localDropdown = () => (
    <select
      className="col-8 form-control"
      required
      name="selectedLocal"
      onChange={this.handleChange}
    >
      {this.props.locals.map(l => (
        <option key={l.id} selected={l.id === 'MANNYUS'} value={l.id}>
          {l.name}
        </option>
      ))}
    </select>
  )

  serviceTimeDropdown = () => {
    const currentLocal = this.props.locals.find(
      l => l.id === this.state.selectedLocal
    )
    return (
      <select
        className="col-8 form-control"
        required
        name="timeSelection"
        onChange={this.handleDateTimeSelection}
      >
        <option selected value={-1}>
          Select Worship Service Schedule
        </option>
        {currentLocal.schedules.map(s => (
          <option key={s.id} value={s.id}>
            {`${s.serviceType} - ${s.day} -
              ${new Date(
                new Date(`2020-01-01T${s.time}Z`).getTime() +
                  new Date(Date.now()).getTimezoneOffset() * 60000 +
                  (moment().isDST() ? 1000 * 60 * 60 : 0)
              ).toLocaleTimeString()}`}
          </option>
        ))}
      </select>
    )
  }

  render() {
    const {appInitialized, user} = this.props
    const {
      selectedWeekNumber,
      selectedServiceType,
      selectedDateTime,
      selectedCustomType
    } = this.state

    console.log(user)

    if (!appInitialized) {
      return <div />
    } else {
      return (
        <Fragment>
          <Container
            as={Form}
            className="d-flex flex-column align-items-center"
            onSubmit={this.handleSubmit}
          >
            <div className="row form-group form-check form-check-inline w-100">
              <label
                className="col-4 font-weight-bold text-right"
                htmlFor="selectedLocal"
              >
                Congregation
              </label>
              {this.localDropdown()}
            </div>
            <div className="row form-group form-check form-check-inline w-100">
              <label
                className="col-4 font-weight-bold text-right"
                htmlFor="timeSelection"
              >
                <span>
                  <strong>OPTIONAL</strong>
                </span>{' '}
                Autofill from Schedule
              </label>
              {this.serviceTimeDropdown()}
            </div>
            <div className="row form-group form-check form-check-inline w-100">
              <label
                className="col-4 font-weight-bold text-right"
                htmlFor="selectedDateTime"
              >
                Worship Service Date Time
              </label>
              <input
                value={selectedDateTime}
                type="datetime-local"
                className="form-control col-8"
                id="selectedDateTime"
                name="selectedDateTime"
                onChange={this.handleChange}
                required
              />
            </div>
            <div className="row form-group form-check form-check-inline w-100">
              <label
                className="col-4 font-weight-bold text-right"
                htmlFor="weekNum"
              >
                Week Number
              </label>
              <input
                value={selectedWeekNumber}
                type="number"
                className="form-control col-8"
                id="selectedWeekNumber"
                name="selectedWeekNumber"
                min="1"
                max="52"
                onChange={this.handleChange}
                required
              />
            </div>
            <div className="row form-group form-check form-check-inline w-100">
              <label
                className="col-4 font-weight-bold text-right"
                htmlFor="serviceType"
              >
                Service Type
              </label>
              <select
                value={selectedServiceType}
                className="form-control col-8"
                id="selectedServiceType"
                name="selectedServiceType"
                required
                onChange={this.handleChange}
              >
                <option selected value="Midweek">
                  Midweek
                </option>
                <option value="Weekend">Weekend</option>
                <option value="CWS">CWS</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="row form-group form-check form-check-inline w-100">
              <label
                className="col-4 font-weight-bold text-right"
                htmlFor="serviceType"
              >
                Custom Service Type
              </label>
              <input
                disabled={this.state.selectedServiceType !== 'Custom'}
                value={selectedCustomType}
                type="text"
                id="selectedCustomType"
                name="selectedCustomType"
                className="form-control col-8"
                onChange={this.handleChange}
              />
            </div>
            <Row>
              <Button
                type="submit"
                disabled={this.state.selectedDateTime.length < 12}
              >
                Create New Worship Service Attendance
              </Button>
            </Row>
          </Container>
        </Fragment>
      )
    }
  }
}

const mapState = state => ({
  user: state.user,
  appInitialized: state.loading.appInitialized,
  members: state.attendance.members,
  locals: state.local.locals
})

const mapDispatch = dispatch => ({
  fetchCreateReportingPeriod: data => dispatch(createReportingPeriodThunk(data))
})

export default connect(mapState, mapDispatch)(WorshipServiceForm)
