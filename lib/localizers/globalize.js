'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = _default
exports.formats = void 0
var dates = _interopRequireWildcard(require('../utils/dates'))
var _oldGlobalize = _interopRequireDefault(require('./oldGlobalize'))
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
    local.format(
      start,
      {
        date: 'short',
      },
      culture
    ) +
    ' – ' +
    local.format(
      end,
      {
        date: 'short',
      },
      culture
    )
  )
}
let timeRangeFormat = (_ref2, culture, local) => {
  let { start, end } = _ref2
  return (
    local.format(
      start,
      {
        time: 'short',
      },
      culture
    ) +
    ' – ' +
    local.format(
      end,
      {
        time: 'short',
      },
      culture
    )
  )
}
let timeRangeStartFormat = (_ref3, culture, local) => {
  let { start } = _ref3
  return (
    local.format(
      start,
      {
        time: 'short',
      },
      culture
    ) + ' – '
  )
}
let timeRangeEndFormat = (_ref4, culture, local) => {
  let { end } = _ref4
  return (
    ' – ' +
    local.format(
      end,
      {
        time: 'short',
      },
      culture
    )
  )
}
let weekRangeFormat = (_ref5, culture, local) => {
  let { start, end } = _ref5
  return (
    local.format(start, 'MMM dd', culture) +
    ' – ' +
    local.format(end, dates.eq(start, end, 'month') ? 'dd' : 'MMM dd', culture)
  )
}
let formats = {
  dateFormat: 'dd',
  dayFormat: 'eee dd/MM',
  weekdayFormat: 'eee',
  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,
  timeGutterFormat: {
    time: 'short',
  },
  monthHeaderFormat: 'MMMM yyyy',
  dayHeaderFormat: 'eeee MMM dd',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,
  agendaDateFormat: 'eee MMM dd',
  agendaTimeFormat: {
    time: 'short',
  },
  agendaTimeRangeFormat: timeRangeFormat,
}
exports.formats = formats
function _default(globalize) {
  let locale = culture => (culture ? globalize(culture) : globalize)

  // return the first day of the week from the locale data. Defaults to 'world'
  // territory if no territory is derivable from CLDR.
  // Failing to use CLDR supplemental (not loaded?), revert to the original
  // method of getting first day of week.
  function firstOfWeek(culture) {
    try {
      const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
      const cldr = locale(culture).cldr
      const territory = cldr.attributes.territory
      const weekData = cldr.get('supplemental').weekData
      const firstDay = weekData.firstDay[territory || '001']
      return days.indexOf(firstDay)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          'Failed to accurately determine first day of the week.' +
            ' Is supplemental data loaded into CLDR?'
        )
      }
      // maybe cldr supplemental is not loaded? revert to original method
      const date = new Date()
      //cldr-data doesn't seem to be zero based
      let localeDay = Math.max(
        parseInt(
          locale(culture).formatDate(date, {
            raw: 'e',
          }),
          10
        ) - 1,
        0
      )
      return Math.abs(date.getDay() - localeDay)
    }
  }
  if (!globalize.load) return (0, _oldGlobalize.default)(globalize)
  return new _localizer.DateLocalizer({
    firstOfWeek,
    formats,
    format(value, format, culture) {
      format =
        typeof format === 'string'
          ? {
              raw: format,
            }
          : format
      return locale(culture).formatDate(value, format)
    },
  })
}
