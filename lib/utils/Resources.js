'use strict'

exports.__esModule = true
exports.NONE = void 0
exports.default = Resources
const NONE = {}
exports.NONE = NONE
function Resources(resources, accessors) {
  return {
    map(fn) {
      if (!resources) return [fn([NONE, null], 0)]
      return resources.map((resource, idx) =>
        fn([accessors.resourceId(resource), resource], idx)
      )
    },
    groupEvents(events) {
      const eventsByResource = new Map()
      if (!resources) {
        // Return all events if resources are not provided
        eventsByResource.set(NONE, events)
        return eventsByResource
      }
      events.forEach(event => {
        const id = accessors.resource(event) || NONE
        if (Array.isArray(id)) {
          id.forEach(item => {
            let resourceEvents = eventsByResource.get(item) || []
            resourceEvents.push(event)
            eventsByResource.set(item, resourceEvents)
          })
        } else {
          let resourceEvents = eventsByResource.get(id) || []
          resourceEvents.push(event)
          eventsByResource.set(id, resourceEvents)
        }
      })
      return eventsByResource
    },
  }
}
