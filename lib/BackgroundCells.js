'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)
var _propTypes = _interopRequireDefault(require('prop-types'))
var _react = _interopRequireDefault(require('react'))
var _reactDom = require('react-dom')
var _clsx = _interopRequireDefault(require('clsx'))
var dates = _interopRequireWildcard(require('./utils/dates'))
var _helpers = require('./utils/helpers')
var _selection = require('./utils/selection')
var _Selection = _interopRequireWildcard(require('./Selection'))
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
class BackgroundCells extends _react.default.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      selecting: false,
    }
  }
  componentDidMount() {
    this.props.selectable && this._selectable()
  }
  componentWillUnmount() {
    this._teardownSelectable()
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectable && !this.props.selectable) this._selectable()
    if (!nextProps.selectable && this.props.selectable)
      this._teardownSelectable()
  }
  render() {
    let {
      range,
      getNow,
      getters,
      date: currentDate,
      components: { dateCellWrapper: Wrapper },
    } = this.props
    let { selecting, startIdx, endIdx } = this.state
    let current = getNow()
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: 'rbc-row-bg',
      },
      range.map((date, index) => {
        let selected = selecting && index >= startIdx && index <= endIdx
        const { className, style } = getters.dayProp(date)
        return /*#__PURE__*/ _react.default.createElement(
          Wrapper,
          {
            key: index,
            value: date,
            range: range,
          },
          /*#__PURE__*/ _react.default.createElement('div', {
            style: style,
            className: (0, _clsx.default)(
              'rbc-day-bg',
              className,
              selected && 'rbc-selected-cell',
              dates.eq(date, current, 'day') && 'rbc-today',
              currentDate &&
                dates.month(currentDate) !== dates.month(date) &&
                'rbc-off-range-bg'
            ),
          })
        )
      })
    )
  }
  _selectable() {
    let node = (0, _reactDom.findDOMNode)(this)
    let selector = (this._selector = new _Selection.default(
      this.props.container,
      {
        longPressThreshold: this.props.longPressThreshold,
      }
    ))
    let selectorClicksHandler = (point, actionType) => {
      if (!(0, _Selection.isEvent)((0, _reactDom.findDOMNode)(this), point)) {
        let rowBox = (0, _Selection.getBoundsForNode)(node)
        let { range, rtl } = this.props
        if ((0, _selection.pointInBox)(rowBox, point)) {
          let currentCell = (0, _selection.getSlotAtX)(
            rowBox,
            point.x,
            rtl,
            range.length
          )
          this._selectSlot({
            startIdx: currentCell,
            endIdx: currentCell,
            action: actionType,
            box: point,
          })
        }
      }
      this._initial = {}
      this.setState({
        selecting: false,
      })
    }
    selector.on('selecting', box => {
      let { range, rtl } = this.props
      let startIdx = -1
      let endIdx = -1
      if (!this.state.selecting) {
        ;(0, _helpers.notify)(this.props.onSelectStart, [box])
        this._initial = {
          x: box.x,
          y: box.y,
        }
      }
      if (selector.isSelected(node)) {
        let nodeBox = (0, _Selection.getBoundsForNode)(node)
        ;({ startIdx, endIdx } = (0, _selection.dateCellSelection)(
          this._initial,
          nodeBox,
          box,
          range.length,
          rtl
        ))
      }
      this.setState({
        selecting: true,
        startIdx,
        endIdx,
      })
    })
    selector.on('beforeSelect', box => {
      if (this.props.selectable !== 'ignoreEvents') return
      return !(0, _Selection.isEvent)((0, _reactDom.findDOMNode)(this), box)
    })
    selector.on('click', point => selectorClicksHandler(point, 'click'))
    selector.on('doubleClick', point =>
      selectorClicksHandler(point, 'doubleClick')
    )
    selector.on('select', bounds => {
      this._selectSlot(
        (0, _extends2.default)({}, this.state, {
          action: 'select',
          bounds,
        })
      )
      this._initial = {}
      this.setState({
        selecting: false,
      })
      ;(0, _helpers.notify)(this.props.onSelectEnd, [this.state])
    })
  }
  _teardownSelectable() {
    if (!this._selector) return
    this._selector.teardown()
    this._selector = null
  }
  _selectSlot(_ref) {
    let { endIdx, startIdx, action, bounds, box } = _ref
    if (endIdx !== -1 && startIdx !== -1)
      this.props.onSelectSlot &&
        this.props.onSelectSlot({
          start: startIdx,
          end: endIdx,
          action,
          bounds,
          box,
          resourceId: this.props.resourceId,
        })
  }
}
BackgroundCells.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        date: _propTypes.default.instanceOf(Date),
        getNow: _propTypes.default.func.isRequired,
        getters: _propTypes.default.object.isRequired,
        components: _propTypes.default.object.isRequired,
        container: _propTypes.default.func,
        dayPropGetter: _propTypes.default.func,
        selectable: _propTypes.default.oneOf([true, false, 'ignoreEvents']),
        longPressThreshold: _propTypes.default.number,
        onSelectSlot: _propTypes.default.func.isRequired,
        onSelectEnd: _propTypes.default.func,
        onSelectStart: _propTypes.default.func,
        range: _propTypes.default.arrayOf(_propTypes.default.instanceOf(Date)),
        rtl: _propTypes.default.bool,
        type: _propTypes.default.string,
        resourceId: _propTypes.default.any,
      }
    : {}
var _default = BackgroundCells
exports.default = _default
module.exports = exports.default
