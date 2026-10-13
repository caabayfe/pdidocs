var Event = Packages.com.snc.commons.eventmgmt.Event;
var JSONObject = Packages.org.json.JSONObject;

var TransformEvents_MidJsonGeneric = Class.create();
TransformEvents_MidJsonGeneric.prototype = {
    initialize: function() {},

    //This function is mandatory for MID Transform Script
    transform: function() {
        /* Function that receives a JSON object, adding all its fields to the Additional information object. The field name is a concatenation of the field key and the parent field key if it exists.*/
        var events = [];
        var event = new Event();
        event.setField("source", "GenericJsonMid");
        //set event class to conenctor instance name if present
        event.setField("event_class", (typeof event_class !== 'undefined' && event_class) ? event_class : "GenericJsonClass");
        event.setField("severity", "5");

        ms.log("TransformEvents_generic received body:" + messageBody);
        // Convert to a JSON object (messageBody is a global variable that contain the event message body)
        var jsonObjectParse = new JSONObject(messageBody);
        var jsonObject = JSON.parse(jsonObjectParse);
        var additionalInfo = {};

        this.updateAdditionalInfo(event, "", jsonObject, additionalInfo);
        /*Iterates over Additional information JSON object and adds all nested objects' fields as fields of the Additional information object*/
        var notDone = true;
        while (notDone) {
            notDone = false;
            for (var key in additionalInfo) {
                if (Object.prototype.toString.call(additionalInfo[key]) == '[object Object]') {
                    notDone = true;
                    this.updateAdditionalInfo(event, key, additionalInfo[key], additionalInfo);
                    additionalInfo[key] = "";
                }
            }
        }
        ms.log("TransformEvents_MidJsonGeneric generated additional information:" + JSON.stringify(additionalInfo));

		// DEF0552476: use 'setText' function to set description.
        // This will leave special character as is in the description value which then will be 
        // handled on mid server based on mid server configuration property i.e. mid.probe.event.suppress.whitespaces
        if (additionalInfo.hasOwnProperty('description')) {
            event.setText(additionalInfo['description']);
            delete additionalInfo['description'];
        }

        // Create the event object
        for (var key1 in additionalInfo) { // Add all Additional information fields to the event
            event.setField(key1, additionalInfo[key1]);
        }

        events[0] = event;
        // STRY55293363: populate connector tags in event additional info
        if (typeof connector_tags !== 'undefined' && connector_tags) {
            var tagPrefix = (typeof alert_tags_prefix !== 'undefined' && alert_tags_prefix) ? alert_tags_prefix : 't_';
            new ConnectorUtil().populateConnectorTagsWithAlertTagPrefix(events, connector_tags, tagPrefix);
        }
        return events;
    },

    updateAdditionalInfo: function(event, field, jsonObject, additionalInfo) {
        for (var key in jsonObject) {
            var newKey = key;
            if (field != "") {
                newKey = field + '_' + key;
            }

            // You can do some transformation here and set fields on the event
            // if(key == "MySource")
            //	event.setField("source", jsonObject[key]);

            additionalInfo[newKey] = jsonObject[key];
        }
    },

    type: 'TransformEvents_MidJsonGeneric'
};
