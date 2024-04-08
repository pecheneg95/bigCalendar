'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)
var _propTypes = _interopRequireDefault(require('prop-types'))
var _clsx = _interopRequireDefault(require('clsx'))
var _react = _interopRequireDefault(require('react'))
var _EventRowMixin = _interopRequireDefault(require('./EventRowMixin'))
class EventRow extends _react.default.Component {
  render() {
    let {
      segments,
      slotMetrics: { slots },
      className,
    } = this.props
    let lastEnd = 1
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: (0, _clsx.default)(className, 'rbc-row'),
      },
      segments.reduce((row, _ref, li) => {
        let { event, left, right, span } = _ref
        let key = '_lvl_' + li
        let gap = left - lastEnd
        let content = _EventRowMixin.default.renderEvent(this.props, event)
        if (gap)
          row.push(_EventRowMixin.default.renderSpan(slots, gap, key + '_gap'))
        row.push(_EventRowMixin.default.renderSpan(slots, span, key, content))
        lastEnd = right + 1
        return row
      }, [])
    )
  }
}
EventRow.propTypes =
  process.env.NODE_ENV !== 'production'
    ? (0, _extends2.default)(
        {
          segments: _propTypes.default.array,
        },
        _EventRowMixin.default.propTypes
      )
    : {}
EventRow.defaultProps = (0, _extends2.default)(
  {},
  _EventRowMixin.default.defaultProps
)
var _default = EventRow
exports.default = _default
module.exports = exports.default
