var Event = Packages.com.snc.commons.eventmgmt.Event;
var StringUtil = Packages.com.glide.util.StringUtil;

var TransformEvents_xmlSample = Class.create();
TransformEvents_xmlSample.prototype = {
    initialize: function() {},

    //This function is mandatory for MID Transform Script
    transform: function() {
        var events = [];

        // ms.log("Message Body: " + messageBody);

        // Use HmlXelper to parse the XML
        var HmlXelper = new XMLHelper(messageBody); // messageBody is a global variable that contain the event message body
        var xmlObject = HmlXelper.toObject();

        //ms.log("XML object: " + JSON.stringify(xmlObject.event[0])); 

        // Loop over the events objects
        if (!Array.isArray(xmlObject.event)) { // If we have only one event object we need to convert it to array
            xmlObject.event = [xmlObject.event];
        }

        var i = 0;
        for (var key in xmlObject.event) {
            var eventObject = xmlObject.event[key];
            //ms.log(JSON.stringify(eventObject));
            var event = new Event();
            for (var propName in eventObject) {
                event.setField(propName, eventObject[propName]);
                //ms.log(propName + " " + eventObject[propName]);
            }
            //set event class to conenctor instance name if present
            if (typeof event_class !== 'undefined' && event_class) {
                event.setField('event_class', event_class);
            }
            // Add the Event to the event queue
            events[i++] = event;
        }

        // STRY55293363: populate connector tags in event additional info
        if (typeof connector_tags !== 'undefined' && connector_tags) {
            var tagPrefix = (typeof alert_tags_prefix !== 'undefined' && alert_tags_prefix) ? alert_tags_prefix : 't_';
            new ConnectorUtil().populateConnectorTagsWithAlertTagPrefix(events, connector_tags, tagPrefix);
        }

        return events;
    },

    type: 'TransformEvents_xmlSample'
};
