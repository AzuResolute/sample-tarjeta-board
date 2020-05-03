import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Route, Switch} from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  Login,
  Signup,
  Board,
  WorshipServiceForm,
  AdHocReport,
  AdHocReportForm,
  MemberDashboard
} from './components'
import {me} from './store'

class Routes extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true
    }
  }

  componentDidMount = async () => {
    await this.props.loadInitialData()
    setTimeout(
      () =>
        this.setState({
          isLoading: false
        }),
      100
    )
  }

  render() {
    const {isLoggedIn} = this.props

    if (this.state.isLoading) {
      return <div />
    }

    return (
      <Switch>
        {/* <Route path="/api/:path" component={Loading} /> */}
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        {isLoggedIn ? (
          <Switch>
            <Route path="/home/:gender" component={Board} />
            <Route
              path="/reports/adhoc/form/:mode"
              component={AdHocReportForm}
            />
            <Route
              path="/reports/adhoc/:mode/:selectionId/:downloadOption"
              component={AdHocReport}
            />
            <Route path="/service/:mode" component={WorshipServiceForm} />
            <Route path="/control/members" component={MemberDashboard} />
            <Route component={Board} />
          </Switch>
        ) : (
          <Route component={Login} />
        )}
      </Switch>
    )
  }
}

const mapState = state => {
  return {
    isLoggedIn: !!state.user.id,
    appInitialized: state.loading.appInitialized
  }
}

const mapDispatch = dispatch => {
  return {
    loadInitialData() {
      dispatch(me())
    }
  }
}

export default withRouter(connect(mapState, mapDispatch)(Routes))

Routes.propTypes = {
  loadInitialData: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired
}
