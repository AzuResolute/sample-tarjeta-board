import XLSX from 'xlsx'
import moment from 'moment'

export const adhocToExcelDownload = table => {
  let adhocReportExcel = XLSX.utils.book_new()
  const adhocReportSheetName = 'Attendance'
  const dateTimeNow = moment(Date.now()).format('MM-DD-YYYY h:mm a')

  adhocReportExcel.SheetNames.push(adhocReportSheetName)
  adhocReportExcel.Sheets[adhocReportSheetName] = XLSX.utils.aoa_to_sheet(table)
  XLSX.writeFile(
    adhocReportExcel,
    `${adhocReportSheetName} ${dateTimeNow}.xlsx`
  )
}
