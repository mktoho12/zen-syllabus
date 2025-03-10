interface SearchResponse {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  subjects: Subject[]
}

interface TextBook {
  title: string
}

interface Metadata {
  enrollmentGrade: string
  credit: string
  quarters: string[]
  subjectRequirement: string
  teachingMethod: string
  evaluationSystem: string
  prerequisiteRecommendedSubjects: Subject[]
  prerequisiteSubjects: Subject[]
  nextRecommendedSubjects: Subject[]
  objective: string
  textBooks: TextBook[]
  learningOutsideClass: string
  specialNotes: string
}

interface CoursePlan {
  title: string
  descripttion: string
}

interface Subject {
  code: string
  name: string
  description: string
  metadata: Metadata
  movieUrl: string
}

const API_ORIGIN = 'https://api.syllabus.zen.ac.jp'

function fetchAndWriteToSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
  const allSubjects: Subject[] = []

  const apiUrl = `${API_ORIGIN}/search`
  const somePageUrl = (page: number) => `${apiUrl}?sort=code-asc&page=${page}`
  const firstPage = fetchData(somePageUrl(1))
  allSubjects.push(...firstPage.subjects)

  for (let page = 2; page <= firstPage.totalPages; page++) {
    const nextPageUrl = somePageUrl(page)
    const nextPage = fetchData(nextPageUrl)
    allSubjects.push(...nextPage.subjects)
  }

  setHeaders(sheet)
  writeDataToSheet(sheet, allSubjects)
}

function fetchData(apiUrl: string): SearchResponse {
  const response = UrlFetchApp.fetch(apiUrl)
  return JSON.parse(response.getContentText()) satisfies SearchResponse
}

function setHeaders(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
  const headers = [
    '科目コード',
    '名称',
    '科目の概要',
    '履修想定年次',
    '単位数',
    '開講Q',
    '科目区分',
    '授業の方法',
    '評価方法',
    '前提推奨科目',
    '前提必須科目',
    '後継推奨科目',
    '到達目標',
    '教科書・参考書',
    '授業時間外の学修',
    '特記事項',
    'Youtube',
  ]
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
}

function writeDataToSheet(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  subjects: Subject[]
) {
  const rows = subjects.map(subject => {
    const {
      code,
      name,
      description,
      metadata: {
        enrollmentGrade,
        credit,
        quarters,
        subjectRequirement,
        teachingMethod,
        evaluationSystem,
        prerequisiteRecommendedSubjects,
        prerequisiteSubjects,
        nextRecommendedSubjects,
        objective,
        textBooks,
        learningOutsideClass,
        specialNotes,
      },
      movieUrl,
    } = subject
    return [
      code,
      name,
      description,
      enrollmentGrade,
      credit,
      quarters.join(' '),
      subjectRequirement,
      teachingMethod,
      evaluationSystem,
      prerequisiteRecommendedSubjects.map(subject => subject.name).join(', '),
      prerequisiteSubjects.map(subject => subject.name).join(', '),
      nextRecommendedSubjects.map(subject => subject.name).join(', '),
      objective,
      textBooks.map(book => book.title).join(', '),
      learningOutsideClass,
      specialNotes,
      movieUrl,
    ]
  })
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows)
}

function onOpen() {
  var ui = SpreadsheetApp.getUi()
  ui.createMenu('ZEN大学シラバス')
    .addItem('最新のシラバスを取得', 'updateSpreadsheet')
    .addToUi()
}

function updateSpreadsheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
  var activeSheet = sheet.getActiveSheet()
  setHeaders(activeSheet)
  fetchAndWriteToSheet(activeSheet)
}
