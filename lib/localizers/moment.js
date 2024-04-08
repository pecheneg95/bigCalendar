'use strict'

exports.__esModule = true
exports.default = _default
exports.formats = void 0
var dates = _interopRequireWildcard(require('../utils/dates'))
var _localizer = require('../localizer')
function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== 'function') return null
  var cacheBabelInterop = new WeakMap()
  var cacheNodeInterop = new WeakMap()
  return (_getRequireWildcardCache = function(nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop
  })(nodeInterop)
}
function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return { default: obj }
  }
  var cache = _getRequireWildcardCache(nodeInterop)
  if (cache && cache.has(obj)) {
    return cache.get(obj)
  }
  var newObj = {}
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor
  for (var key in obj) {
    if (key !== 'default' && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc)
      } else {
        newObj[key] = obj[key]
      }
    }
  }
  newObj.default = obj
  if (cache) {
    cache.set(obj, newObj)
  }
  return newObj
}
let dateRangeFormat = (_ref, culture, local) => {
  let { start, end } = _ref
  return (
    local.format(start, 'L', culture) + ' – ' + local.format(end, 'L', culture)
  )
}
let timeRangeFormat = (_ref2, culture, local) => {
  let { start, end } = _ref2
  return (
    local.format(start, 'LT', culture) +
    ' – ' +
    local.format(end, 'LT', culture)
  )
}
let timeRangeStartFormat = (_ref3, culture, local) => {
  let { start } = _ref3
  return local.format(start, 'LT', culture) + ' – '
}
let timeRangeEndFormat = (_ref4, culture, local) => {
  let { end } = _ref4
  return ' – ' + local.format(end, 'LT', culture)
}
let weekRangeFormat = (_ref5, culture, local) => {
  let { start, end } = _ref5
  return (
    local.format(start, 'MMMM DD', culture) +
    ' – ' +
    local.format(end, dates.eq(start, end, 'month') ? 'DD' : 'MMMM DD', culture)
  )
}
let formats = {
  dateFormat: 'DD',
  dayFormat: 'DD ddd',
  weekdayFormat: 'ddd',
  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,
  timeGutterFormat: 'LT',
  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'dddd MMM DD',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,
  agendaDateFormat: 'ddd MMM DD',
  agendaTimeFormat: 'LT',
  agendaTimeRangeFormat: timeRangeFormat,
}
exports.formats = formats
function _default(moment) {
  let locale = (m, c) => (c ? m.locale(c) : m)
  return new _localizer.DateLocalizer({
    formats,
    firstOfWeek(culture) {
      let data = culture ? moment.localeData(culture) : moment.localeData()
      return data ? data.firstDayOfWeek() : 0
    },
    format(value, format, culture) {
      return locale(moment(value), culture).format(format)
    },
  })
}
