'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _clsx = _interopRequireDefault(require('clsx'))
var _propTypes = _interopRequireDefault(require('prop-types'))
var _react = _interopRequireWildcard(require('react'))
var TimeSlotUtils = _interopRequireWildcard(require('./utils/TimeSlots'))
var _TimeSlotGroupHr = _interopRequireDefault(require('./TimeSlotGroupHr'))
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
class TimeGutter extends _react.Component {
  constructor() {
    super(...arguments)
    this.renderSlot = (value, idx) => {
      if (idx !== 0) return null
      const { localizer, getNow } = this.props
      const isNow = this.slotMetrics.dateIsInGroup(getNow(), idx)
      return /*#__PURE__*/ _react.default.createElement(
        'span',
        {
          className: (0, _clsx.default)('rbc-label', isNow && 'rbc-now'),
        },
        localizer.format(value, 'timeGutterFormat')
      )
    }
    const { min, max, timeslots, step } = this.props
    this.slotMetrics = TimeSlotUtils.getSlotMetrics({
      min,
      max,
      timeslots,
      step,
    })
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { min, max, timeslots, step } = nextProps
    this.slotMetrics = this.slotMetrics.update({
      min,
      max,
      timeslots,
      step,
    })
  }
  render() {
    const { resource, components, getters } = this.props
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: 'rbc-time-gutter rbc-time-gutter--hr',
      },
      this.slotMetrics.groups.map((grp, idx) => {
        return /*#__PURE__*/ _react.default.createElement(
          _TimeSlotGroupHr.default,
          {
            key: idx,
            group: grp,
            resource: resource,
            components: components,
            renderSlot: this.renderSlot,
            getters: getters,
          }
        )
      })
    )
  }
}
exports.default = TimeGutter
TimeGutter.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        min: _propTypes.default.instanceOf(Date).isRequired,
        max: _propTypes.default.instanceOf(Date).isRequired,
        timeslots: _propTypes.default.number.isRequired,
        step: _propTypes.default.number.isRequired,
        getNow: _propTypes.default.func.isRequired,
        components: _propTypes.default.object.isRequired,
        getters: _propTypes.default.object,
        localizer: _propTypes.default.object.isRequired,
        resource: _propTypes.default.string,
      }
    : {}
module.exports = exports.default
