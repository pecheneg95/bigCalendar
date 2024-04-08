'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = moveDate
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectWithoutPropertiesLoose')
)
var _invariant = _interopRequireDefault(require('invariant'))
var _constants = require('./constants')
var _Views = _interopRequireDefault(require('../Views'))
const _excluded = ['action', 'date', 'today']
function moveDate(View, _ref) {
  let { action, date, today } = _ref,
    props = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded)
  View = typeof View === 'string' ? _Views.default[View] : View
  switch (action) {
    case _constants.navigate.TODAY:
      date = today || new Date()
      break
    case _constants.navigate.DATE:
      break
    default:
      !(View && typeof View.navigate === 'function')
        ? process.env.NODE_ENV !== 'production'
          ? (0, _invariant.default)(
              false,
              'Calendar View components must implement a static `.navigate(date, action)` method.s'
            )
          : (0, _invariant.default)(false)
        : void 0
      date = View.navigate(date, action, props)
  }
  return date
}
module.exports = exports.default
