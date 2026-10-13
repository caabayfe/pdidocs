var Event = Packages.com.snc.commons.eventmgmt.Event;
var StringUtil = Packages.com.glide.util.StringUtil;
var JSONObject = Packages.org.json.JSONObject;
var SimpleDateFormat = Packages.java.text.SimpleDateFormat;
var StringUtil = Packages.com.glide.util.StringUtil;
var TimeZone = Packages.java.util.TimeZone;

var TransformEvents_bmcTrueSight = Class.create();
TransformEvents_bmcTrueSight.prototype = {
    initialize: function() {},

    //This function is mandatory for MID Transform Script
    transform: function() {
        var events = [];
        var jsonObject = new JSONObject(messageBody); // Convert to a JSON object (messageBody is a global variable that contain the event message body)

        var keys = jsonObject.keySet().toArray();
        //ms.log("keys: " + keys);
        var event = new Event();
        var hasEvent = false;
        var hasSource = false;
        for (var key in keys) { // Go over the JSON keys
            hasEvent = true;
            var keyVal = keys[key];
            var value = jsonObject.get(keys[key]);
            if (keyVal == "type") // type set by mc_object_class field
                keyVal = "original_type";
            //ms.log("key = " + keyVal);
            //ms.log("Value: " + value);

            if (keyVal == "data") { // data field is a JSON object
                var eventObject = jsonObject.getJSONObject("data");
                var dataKeys = eventObject.keySet().toArray();
                //ms.log("dataKeys: " + JSON.stringify(dataKeys));
                for (var dataKey in dataKeys) { // Go over the data field (JSON) keys
                    var dataKeyVal = dataKeys[dataKey];
                    var dataValue = eventObject.get(dataKeyVal);
                    if (dataKeyVal == "mc_ueid")
                        event.setField("message_key", dataValue);
                    if (dataKeyVal == "msg")
                        event.setField("description", dataValue);
                    if (dataKeyVal == "mc_host")
                        event.setField("node", dataValue);
                    if (dataKeyVal == "mc_parameter")
                        event.setField("metric_name", dataValue);
                    if (dataKeyVal == "mc_object")
                        event.setField("resource", dataValue);
                    if (dataKeyVal == "mc_object_class")
                        event.setField("type", dataValue);
                    if (dataKeyVal == "source") {
                        event.setField("source", dataValue);
                        hasSource = true;
                    }
                    if (dataKeyVal == "severity") {
                        if (dataValue.toUpperCase() == "CRITICAL") {
                            dataValue = "1";
                        } else if (dataValue.toUpperCase() == "MAJOR") {
                            dataValue = "2";
                        } else if (dataValue.toUpperCase() == "MINOR") {
                            dataValue = "3";
                        } else if (dataValue.toUpperCase() == "WARNING") {
                            dataValue = "4";
                        } else if (dataValue.toUpperCase() == "INFO") {
                            dataValue = "5";
                        } else if (dataValue.toUpperCase() == "OK") {
                            dataValue = "0"; // Clear
                        }
                    }

                    if (dataKeyVal == "date_reception" && StringUtil.isNumeric(dataValue))
                        event.setField("time_of_event", this.formatDate(dataValue));

                    //ms.log("dataKey = " + dataKeyVal);
                    //ms.log("dataValue: " + dataValue);
                    event.setField(dataKeyVal, dataValue);
                }
            } else {
                event.setField(keyVal, value);
            }
        }

        if (hasEvent) {
            if (!hasSource)
                event.setField("source", "BMC TrueSight");
            //set event class to conenctor instance name if present
            if (typeof event_class !== 'undefined' && event_class) {
                event.setField('event_class', event_class);
            }
            events[0] = event;
        }

        // STRY55293363: populate connector tags in event additional info
        if (typeof connector_tags !== 'undefined' && connector_tags) {
            var tagPrefix = (typeof alert_tags_prefix !== 'undefined' && alert_tags_prefix) ? alert_tags_prefix : 't_';
            new ConnectorUtil().populateConnectorTagsWithAlertTagPrefix(events, connector_tags, tagPrefix);
        }
        return events;
    },

    formatDate: function(timeInSeconds) {
        var pattern = "yyyy-MM-dd HH:mm:ss";

        var format = new SimpleDateFormat(pattern);
        format.setTimeZone(TimeZone.getTimeZone("GMT"));
        var eventTime = new Date(timeInSeconds * 1000);
        var dateFormat = format.format(eventTime);

        return dateFormat;
    },

    type: 'TransformEvents_bmcTrueSight'
};
