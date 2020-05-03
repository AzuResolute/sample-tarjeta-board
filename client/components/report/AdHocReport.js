import React, {Component, Fragment} from 'react'
import {Tab} from 'react-bootstrap'
import AdHocReportPane from './AdHocReportPane'
import {connect} from 'react-redux'
import TabNav from '../nav/TabNav'
import axios from 'axios'
import EditAttendanceModal from './EditAttendanceModal'

class AdHocReport extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      showEditAttendance: false,
      selectedAttendance: {},
      selectedService: {},
      attendance: {},
      services: [],
      districtRegion: 'NYUS' /* For district functionality */
    }
  }

  componentDidMount = async () => {
    const {selectionId, mode} = this.props.match.params
    if (mode === 'week') {
      this.setState({
        isLoading: true
      })
    }
    if (mode === 'period') {
      if (selectionId !== 'current') {
        const {data} = await axios.get(`/api/ws/reporting/${selectionId}/ext`)
        await this.setState({
          attendance: this.consolidateAttendanceToMembers(data),
          services: data
        })
      }
    }
  }

  componentDidUpdate = async (prevProps, prevState) => {
    const {mode, selectionId} = this.props.match.params
    const {members} = this.props
    if (
      mode === 'period' &&
      selectionId === 'current' &&
      Object.keys(this.state.attendance).length === 0 &&
      members.length > 0
    ) {
      this.loadCurrentData()
    } else if (
      this.state.isLoading &&
      Object.keys(this.state.attendance).length < 2 &&
      mode === 'week'
    ) {
      const [localId, weekNumber] = selectionId.split('@')

      let {data} = await axios.get(
        `/api/ws/local/${localId}/ext/week/${weekNumber}`
      )

      let services = data

      await this.setState({
        services
      })

      let newServices = [...services]

      let attendances = await axios.all(
        newServices.map(s => axios.get(`/api/attendance/ws/${s.id}`))
      )

      newServices = newServices.map((s, i) => {
        s.attendances = attendances[i].data
        return s
      })

      this.setState({
        attendance: this.consolidateAttendanceToMembers(newServices),
        services: newServices,
        isLoading: false
      })
    }
  }

  consolidateAttendanceToMembers = attendance => {
    const attendanceFromAllServices = attendance.reduce((accum, s) => {
      accum = accum.concat(s.attendances)
      return accum
    }, [])

    const consolidatedAttendance = attendanceFromAllServices.reduce(
      (accum, a, i) => {
        const {
          id,
          hasAttended,
          localId,
          areaGroup,
          lastName,
          firstName,
          cfo,
          officer,
          gender,
          code,
          notes,
          memberId,
          worshipserviceId
        } = a
        if (!accum[memberId]) {
          accum[memberId] = {
            memberId: memberId,
            lastName: [lastName],
            firstName: [firstName],
            localId: [localId],
            areaGroup: [areaGroup],
            lag: [`${localId}%${areaGroup}`],
            cfo: [cfo],
            officer: [officer],
            gender: [gender],
            services: [
              {
                id,
                worshipserviceId,
                hasAttended,
                code,
                notes
              }
            ]
          }
        } else {
          const attendanceKeys = Object.keys(accum[memberId])
          attendanceKeys.shift() // remove memberId
          attendanceKeys.pop() // remove services
          attendanceKeys.forEach(ak => {
            if (ak === 'lag') {
              if (
                accum[memberId].lag.indexOf(`${localId}%${areaGroup}`) === -1
              ) {
                accum[memberId].lag.push(`${localId}%${areaGroup}`)
              }
            } else if (accum[memberId][ak].indexOf(a[ak]) === -1) {
              accum[memberId][ak].push(a[ak])
            }
          })
          accum[memberId].services.push({
            id,
            worshipserviceId,
            hasAttended,
            code,
            notes
          })
        }
        return accum
      },
      {}
    )
    return consolidatedAttendance
  }

  tabulizeAreaGroupMembers = () => {
    const {members} = this.props
    return members.reduce((a, m) => {
      m.lag.forEach(lag => {
        const [localId, areaGroup] = lag.split('%')
        const tabName = `${localId.slice(0, 3)} ${areaGroup}`
        if (!a[tabName]) a[tabName] = [m]
        else a[tabName].push(m)
        return a
      })
    }, {})
  }

  loadCurrentData = async () => {
    const {members, worshipService} = this.props.attendance
    const formattedMembers = await members.map((m, i) => {
      let newMember = JSON.parse(JSON.stringify(m))
      newMember.memberId = m.id
      newMember.id = `TEMP${i}`
      newMember.worshipserviceId = worshipService.id
      return newMember
    })
    worshipService.attendances = formattedMembers
    this.setState({
      attendance: this.consolidateAttendanceToMembers([worshipService]),
      services: [worshipService]
    })
  }

  tabulizeAreaGroupAttendance = () => {
    const {attendance} = this.state
    const attendanceKeys = Object.keys(attendance)
    return attendanceKeys.reduce((a, k) => {
      const currentMemberAttendance = attendance[k]
      currentMemberAttendance.lag.forEach(lag => {
        const [localId, areaGroup] = lag.split('%')
        const tabName = `${localId.slice(0, 3)} ${areaGroup}`
        if (!a[tabName]) a[tabName] = [currentMemberAttendance]
        else a[tabName].push(currentMemberAttendance)
      })
      return a
    }, {})
  }

  handleSelectAttendance = async (attendanceId, selectedService) => {
    const {data} = await axios.get(`/api/attendance/${attendanceId}`)
    this.setState({
      selectedAttendance: data,
      selectedService
    })
    this.setState({
      showEditAttendance: true
    })
  }

  confirmClose = () =>
    this.setState({
      showEditAttendance: false,
      selectedAttendance: {}
    })

  render() {
    let {
      attendance,
      services,
      districtRegion,
      selectedAttendance,
      selectedService,
      showEditAttendance
    } = this.state
    const {selectionId, downloadOption} = this.props.match.params
    const {appInitialized} = this.props

    if (!appInitialized || attendance.length === 0) {
      return <div />
    }

    let tabs = this.tabulizeAreaGroupAttendance()
    const tabNames = Object.keys(tabs)
    tabNames.unshift('ALL')

    return !appInitialized || Object.keys(attendance).length === 0 ? (
      <div />
    ) : (
      <Fragment>
        <Tab.Container defaultActiveKey={tabNames[0]}>
          <TabNav tabs={tabNames} />
          <Tab.Content>
            {tabNames.map(t => {
              const [localId, areaGroup] = t.split(' ')
              return (
                <Tab.Pane key={t} eventKey={t} title={t}>
                  <AdHocReportPane
                    tab={t}
                    areaGroup={areaGroup}
                    localId={`${localId}${districtRegion}`}
                    selectionId={selectionId}
                    attendance={t === 'ALL' ? attendance : tabs[t]}
                    downloadOption={downloadOption}
                    services={services}
                    handleSelectAttendance={this.handleSelectAttendance}
                  />
                </Tab.Pane>
              )
            })}
          </Tab.Content>
        </Tab.Container>
        {showEditAttendance ? (
          <EditAttendanceModal
            show={showEditAttendance}
            onHide={this.confirmClose}
            selectedAttendance={selectedAttendance}
            worshipService={selectedService}
          />
        ) : (
          <div />
        )}
      </Fragment>
    )
  }
}

const mapState = state => ({
  appInitialized: state.loading.appInitialized,
  attendance: state.attendance,
  members: state.attendance.members
})

export default connect(mapState)(AdHocReport)
