'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
exports.__esModule = true
exports.default = void 0
var _propTypes = _interopRequireDefault(require('prop-types'))
var _clsx = _interopRequireDefault(require('clsx'))
var _scrollbarSize = _interopRequireDefault(
  require('dom-helpers/scrollbarSize')
)
var _react = _interopRequireDefault(require('react'))
var dates = _interopRequireWildcard(require('./utils/dates'))
var _Header = _interopRequireDefault(require('./Header'))
var _ResourceHeader = _interopRequireDefault(require('./ResourceHeader'))
var _helpers = require('./utils/helpers')
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
class TimeGridHeader extends _react.default.Component {
  constructor() {
    super(...arguments)
    this.handleHeaderClick = (date, view, e) => {
      e.preventDefault()
      ;(0, _helpers.notify)(this.props.onDrillDown, [date, view])
    }
  }
  renderHeaderCells(range) {
    let {
      localizer,
      getDrilldownView,
      getNow,
      getters: { dayProp },
      components: { header: HeaderComponent = _Header.default },
    } = this.props
    const today = getNow()
    return range.map((date, i) => {
      let drilldownView = getDrilldownView(date)
      let label = localizer.format(date, 'dayFormat')
      const { className, style } = dayProp(date)
      let header = /*#__PURE__*/ _react.default.createElement(HeaderComponent, {
        date: date,
        label: label,
        localizer: localizer,
      })
      return /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          key: i,
          style: style,
          className: (0, _clsx.default)(
            'rbc-header',
            className,
            dates.eq(date, today, 'day') && 'rbc-today'
          ),
        },
        drilldownView
          ? /*#__PURE__*/ _react.default.createElement(
              'a',
              {
                href: '#',
                onClick: e => this.handleHeaderClick(date, drilldownView, e),
              },
              header
            )
          : /*#__PURE__*/ _react.default.createElement('span', null, header)
      )
    })
  }
  render() {
    let {
      rtl,
      resources,
      range,
      accessors,
      scrollRef,
      isOverflowing,
      components: {
        resourceHeader: ResourceHeaderComponent = _ResourceHeader.default,
      },
    } = this.props
    let style = {}
    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] =
        (0, _scrollbarSize.default)() + 'px'
    }
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        style: style,
        ref: scrollRef,
        className: (0, _clsx.default)(
          'rbc-time-header',
          isOverflowing && 'rbc-overflowing',
          'rbc-time-header--hr'
        ),
      },
      resources.map((_ref, idx) => {
        let [id, resource] = _ref
        return /*#__PURE__*/ _react.default.createElement(
          'div',
          {
            className: 'rbc-time-header-content rbc-time-header-content--hr',
            key: id || idx,
          },
          resource &&
            /*#__PURE__*/ _react.default.createElement(
              'div',
              {
                className: 'rbc-resource rbc-resource--hr',
                key: 'resource_' + idx,
              },
              /*#__PURE__*/ _react.default.createElement(
                'div',
                {
                  className: 'rbc-header',
                },
                /*#__PURE__*/ _react.default.createElement(
                  ResourceHeaderComponent,
                  {
                    index: idx,
                    label: accessors.resourceTitle(resource),
                    resource: resource,
                  }
                )
              )
            ),
          /*#__PURE__*/ _react.default.createElement(
            'div',
            {
              className:
                'rbc-row rbc-time-header-cell' +
                (range.length <= 1 ? ' rbc-time-header-cell-single-day' : ''),
            },
            this.renderHeaderCells(range)
          )
        )
      })
    )
  }
}
TimeGridHeader.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        range: _propTypes.default.array.isRequired,
        events: _propTypes.default.array.isRequired,
        resources: _propTypes.default.object,
        getNow: _propTypes.default.func.isRequired,
        isOverflowing: _propTypes.default.bool,
        rtl: _propTypes.default.bool,
        width: _propTypes.default.number,
        localizer: _propTypes.default.object.isRequired,
        accessors: _propTypes.default.object.isRequired,
        components: _propTypes.default.object.isRequired,
        getters: _propTypes.default.object.isRequired,
        selected: _propTypes.default.object,
        selectable: _propTypes.default.oneOf([true, false, 'ignoreEvents']),
        longPressThreshold: _propTypes.default.number,
        onSelectSlot: _propTypes.default.func,
        onSelectEvent: _propTypes.default.func,
        onDoubleClickEvent: _propTypes.default.func,
        onKeyPressEvent: _propTypes.default.func,
        onDrillDown: _propTypes.default.func,
        getDrilldownView: _propTypes.default.func.isRequired,
        scrollRef: _propTypes.default.any,
      }
    : {}
var _default = TimeGridHeader
exports.default = _default
module.exports = exports.default
