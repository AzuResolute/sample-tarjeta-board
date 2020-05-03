import React, {Component, Fragment} from 'react'
import {Button, Form, Container, Row} from 'react-bootstrap'
import {createReportingPeriodThunk} from '../../store'
import {connect} from 'react-redux'
import axios from 'axios'
import history from '../../history'
import {GenericDropdown} from '../misc/dropdowns'

class AdHocReportForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedLocal: 'MANNYUS',
      reportingPeriods: [],
      selectedReportingPeriod: 0,
      selectedWeekNumber: 0,
      downloadOption: 'report-only'
    }
  }

  componentDidMount = () => {
    this.getReportingPeriodsArrayFromLocalId()
  }

  getReportingPeriodsArrayFromLocalId = async () => {
    const {data} = await axios.get(
      `/api/reporting/local/${this.state.selectedLocal}`
    )
    this.setState({
      reportingPeriods: data
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    const {mode} = this.props.match.params
    const {
      selectedLocal,
      selectedReportingPeriod,
      selectedWeekNumber,
      downloadOption
    } = this.state
    if (mode === 'period') {
      history.push(
        `/reports/adhoc/period/${selectedReportingPeriod}/${downloadOption}`
      )
    } else if (mode === 'week') {
      history.push(
        `/reports/adhoc/week/${selectedLocal}@${selectedWeekNumber}/${downloadOption}`
      )
    }
  }

  handleChange = async e => {
    await this.setState({
      [e.target.name]: e.target.value
    })
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

  weekNumberDropdown = () => {
    const {reportingPeriods} = this.state
    const options = reportingPeriods
      .reduce(
        (accum, rp) => {
          if (accum.indexOf(rp.weekNumber) === -1) {
            accum.push(rp.weekNumber)
          }
          return accum
        },
        [0]
      )
      .sort()
    const defLabel =
      options.length === 1 ? ['No Records Available'] : ['Select Week Number']
    let labels = defLabel.concat(options.slice(1))
    return (
      <GenericDropdown
        defaultProperty={0}
        handleChange={this.handleChange}
        property="selectedWeekNumber"
        options={options}
        labels={labels}
      />
    )
  }

  reportingPeriodDropdown = () => {
    const {reportingPeriods} = this.state
    return (
      <select
        className="col-8 form-control"
        required
        name="selectedReportingPeriod"
        onChange={this.handleChange}
      >
        <option selected value={0}>
          {reportingPeriods.length > 0
            ? 'Select Reporting Period'
            : 'No Reporting Periods Recorded'}
        </option>
        {reportingPeriods.map(r => (
          <option key={r.id} value={r.id}>
            {`${r.serviceType}
             - Week ${r.weekNumber}
             - ${r.year}`}
          </option>
        ))}
      </select>
    )
  }

  secondDropdown = () => {
    const {mode} = this.props.match.params
    if (mode === 'period') {
      return (
        <Fragment>
          <label
            className="col-4 font-weight-bold text-right"
            htmlFor="selectedReportingPeriod"
          >
            Select Reporting Period
          </label>
          {this.reportingPeriodDropdown()}
        </Fragment>
      )
    } else if (mode === 'week') {
      return (
        <Fragment>
          <label
            className="col-4 font-weight-bold text-right"
            htmlFor="selectedReportingPeriod"
          >
            Select Week Number
          </label>
          {this.weekNumberDropdown()}
        </Fragment>
      )
    }
  }

  downloadDropdown = () => {
    return (
      <Fragment>
        <label
          className="col-4 font-weight-bold text-right"
          htmlFor="downloadOption"
        >
          Select Download Option
        </label>
        <GenericDropdown
          defaultProperty="report-only"
          handleChange={this.handleChange}
          property="downloadOption"
          options={['xlsx', 'report-only']}
          labels={['Download in Excel file', 'None']}
        />
      </Fragment>
    )
  }

  render() {
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
            {this.secondDropdown()}
          </div>
          <div className="row form-group form-check form-check-inline w-100">
            {this.downloadDropdown()}
          </div>

          <Row>
            <Button
              type="submit"
              disabled={
                this.state.selectedReportingPeriod == 0 &&
                this.state.selectedWeekNumber == 0
              }
            >
              Create Ad Hoc Report
            </Button>
          </Row>
        </Container>
      </Fragment>
    )
  }
}

const mapState = state => ({
  members: state.attendance.members,
  locals: state.local.locals
})

const mapDispatch = dispatch => ({
  fetchCreateReportingPeriod: data => dispatch(createReportingPeriodThunk(data))
})

export default connect(mapState, mapDispatch)(AdHocReportForm)
