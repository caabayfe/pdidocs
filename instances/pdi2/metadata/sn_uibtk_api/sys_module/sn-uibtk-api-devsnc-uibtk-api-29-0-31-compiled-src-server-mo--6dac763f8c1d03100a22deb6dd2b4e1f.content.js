
      "use strict";
exports.__esModule = true;
exports.EventFetcher = void 0;
var glide_1 = require("@servicenow/glide");
var EventFetcher = /** @class */ (function () {
    function EventFetcher() {
        this.eventLookupMap = new Map();
    }
    EventFetcher.prototype.GetEventById = function (id) {
        // Check if the event is already in the map
        // 1. Check if the event is already in the map
        // 2. If it is, return it
        // 3. If it isn't, fetch it from the database
        // 4. Store it in the map and return it
        // 5. If the event is not found, return null
        if (this.eventLookupMap.has(id)) {
            return this.eventLookupMap.get(id);
        }
        var grEvent = new glide_1.GlideRecord('sys_ux_event');
        if (grEvent.get(id)) {
            var event_1 = {
                sysId: grEvent.getUniqueValue(),
                eventName: grEvent.getValue('name'),
                description: grEvent.getValue('description')
                // / ... more
            };
            this.eventLookupMap.set(id, event_1);
            return event_1;
        }
        else {
            return null; // Event not found
        }
    };
    EventFetcher.prototype.EventHydrater = function (ids) {
        var _this = this;
        var idsToFetch = ids.reduce(function (acc, id) {
            if (!_this.eventLookupMap.has(id)) {
                acc.push(id);
            }
            return acc;
        }, []);
        var grEvent = new glide_1.GlideRecord('sys_ux_event');
        grEvent.addQuery('sys_id', 'IN', idsToFetch);
        // ....
    };
    return EventFetcher;
}());
exports.EventFetcher = EventFetcher;
