function transform(input) {

    var returnObj = {};
    var dueDateObjectsArray = [];
    var rangeArray = [];
    var isEmpty = false;
    var previousDate = '';

    var todaysDate = new GlideDateTime();
    todaysDate.getLocalDate();

    var currentDateTime = new GlideDateTime();
    currentDateTime.getLocalDate();
    currentDateTime.addDays(-30);

    previousDate = currentDateTime.getLocalDate();
    var startTime = currentDateTime.getDisplayValue();

    currentDateTime.addDays(91);
    var endTime = currentDateTime.getDisplayValue();

    var eventList = CriticalUpdatesConstants.TIMELINE_EVENTS.EVENTS;
    for (var key in eventList) {
        var timestampArray = [];
        var timestampArr = [];
        var rangesArr = [];

        var eventName = eventList[key];
        if (CriticalUpdatesConstants.TIMELINE_EVENTS.EVENTS_COLOR.hasOwnProperty(key)) {
            var eventColor = CriticalUpdatesConstants.TIMELINE_EVENTS.EVENTS_COLOR[key];
        }

        if (eventName == CriticalUpdatesConstants.TIMELINE_EVENTS.EVENTS.DUE_SOON) {
            timestampArr = getRecords(todaysDate, endTime);
            rangesArr.push({
                "start": todaysDate.getNumericValue(),
                "end": currentDateTime.getNumericValue(),
                "description": CriticalUpdatesConstants.TIMELINE_EVENTS.EVENTS.DUE_SOON
            });
        } else {
            timestampArr = getRecords(startTime, todaysDate);
            rangesArr.push({
                "start": previousDate.getNumericValue(),
                "end": todaysDate.getNumericValue(),
                "description": CriticalUpdatesConstants.TIMELINE_EVENTS.EVENTS.OVERDUE
            });
        }
        var localizedEventName = gs.getMessage("{0}", [eventName]);
        dueDateObjectsArray.push({
            "name": eventName,
            "icon": 'starFill',
            "label": localizedEventName,
            "color": eventColor,
            "size": "xl",
            "labelPlural": localizedEventName,
            "events": timestampArr,
            "isVisible": true
        });

        rangeArray.push({
            "name": eventName,
            "label": localizedEventName,
            "color": eventColor,
            "ranges": rangesArr,
            "isVisible": true
        });
    }

    isEmpty = !dueDateObjectsArray.length;

    returnObj = {
        startDateTime: previousDate.getNumericValue(),
        endDateTime: currentDateTime.getNumericValue(),
        isEmpty: isEmpty,
        dueDateObjectsArray: dueDateObjectsArray,
        rangeArray: rangeArray
    };

    return returnObj;

    function getRecords(startTime, endTime) {
        var gr = new GlideRecord('sn_critical_update');
        gr.addQuery('up_due_date', '>=', startTime);
        gr.addQuery('up_due_date', '<=', endTime);
        gr.addQuery('up_update_status', '!=', 'acknowledged');
        gr.addQuery('up_active', true);
        gr.query();
        while (gr.next()) {
            var sysId = gr.sys_id.toString();
            var gdt = new GlideDateTime(gr.up_due_date);
            gdt.getLocalDate();
            timestampArray.push({
                "timestamp": gdt.getNumericValue(),
                "description": gr.up_name.getDisplayValue() + " " + eventName,
                "id": sysId
            });
        }

        return timestampArray;
    }
}
