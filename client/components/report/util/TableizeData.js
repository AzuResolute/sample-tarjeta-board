import {CFO} from '../../../utils/board'

export default class TableizeData {
  constructor(data) {
    const {locals, attendance, services, isCurrentService} = data
    this.locals = locals
    this.attendance = attendance
    this.services = services
    this.isCurrentService = isCurrentService
    this.table = this.headers = []

    //Tableizer Created
    this.createTable()
    // this.run()
  }

  // create header
  createTable = () => {
    const headersArr = [
      'Id',
      'Last Name',
      'First Name',
      'Local',
      'Area-Group',
      'CFO',
      'Officer',
      'Gender'
    ]

    this.headers = [...headersArr, ...this.createServicesHeading()]
    this.table = [this.headers, ...this.mergeMemberInfoAndAttendances()]
  }

  // services need to be in a certain format
  createServicesHeading = () => {
    const serviceDateTimeArray = this.services.map(s => s.dateTime)

    const formatServiceDateTime = dateTime =>
      new Date(
        new Date(dateTime).getTime() +
          new Date(Date.now()).getTimezoneOffset() * 60000
      ).toLocaleTimeString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

    const serviceHeading = serviceDateTimeArray.map(dateTime =>
      formatServiceDateTime(dateTime)
    )

    return serviceHeading
  }

  mergeMemberInfoAndAttendances = () => {
    const infoArr = this.createMemberInfoArr()
    const attendancesArr = this.createMemberAttendancesArr()

    if (infoArr.length === attendancesArr.length) {
      const mergedArr = []

      for (let i = 0; i < infoArr.length; i++) {
        mergedArr.push([...infoArr[i], ...attendancesArr[i]])
      }

      return mergedArr
    } else {
      console.log('Error - Not Same Size')
    }
  }

  createMemberInfoArr = () => {
    const memberIds = Object.keys(this.attendance)

    const newRow = memberIds.map(id => {
      const member = this.attendance[id]

      return [
        id,
        member.lastName.join(', '),
        member.firstName.join(', '),
        this.locals
          .filter(l => member.localId.includes(l.id))
          .map(l => l.name)
          .join(', '),
        member.areaGroup.join(', '),
        member.cfo.map(cfo => CFO[cfo]).join(', '),
        member.officer.join(', '),
        member.gender.join(', ')
      ]
    })

    return newRow
  }

  createMemberAttendancesArr = () => {
    const memberIds = Object.keys(this.attendance)

    const newRow = memberIds.map(id => {
      const member = this.attendance[id]

      return this.isCurrentService
        ? this.showCurrentServiceAttendance(member)
        : this.showPastServicesAttendances(member)
    })

    return newRow
  }

  showCurrentServiceAttendance = member => {
    const service = member.service[0]
    return [service.hasAttended ? 'YES' : 'NO']
  }

  showPastServicesAttendances = member => {
    // we need to go through all services just incase the person was not registered
    // in the locale at this time
    return this.services.map(s => {
      const memberAttendance = member.services.find(
        a => a.worshipserviceId === s.id
      )

      return !memberAttendance
        ? 'N/A'
        : memberAttendance.hasAttended ? 'YES' : 'NO'
    })
  }

  // render

  // run = () => {
  //   console.log('Running =================================')
  //   console.log(this.table)
  //   console.info(this.attendance)
  //   console.log('Run Complete ============================')
  // }
}
