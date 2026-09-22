// Open-Meteo's archive has a data-availability lag, so the latest usable
// end date is a few days behind today — default to 10 days back. Default
// analysis window: 2 years. Shared between RouteAnalysisPanel (manual date
// pickers) and the routes list's quick-analyze button (no picker, just runs
// with these defaults).
const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

export const defaultAnalysisEndDate = (): Date => {
  const date = new Date()
  date.setDate(date.getDate() - 10)
  return date
}

export const defaultAnalysisStartDate = (endDate: Date): Date => {
  const date = new Date(endDate)
  date.setFullYear(date.getFullYear() - 2)
  return date
}

export const defaultAnalysisRangeIso = (): { startDate: string; endDate: string } => {
  const endDate = defaultAnalysisEndDate()
  const startDate = defaultAnalysisStartDate(endDate)
  return { startDate: toIsoDate(startDate), endDate: toIsoDate(endDate) }
}

export { toIsoDate }
