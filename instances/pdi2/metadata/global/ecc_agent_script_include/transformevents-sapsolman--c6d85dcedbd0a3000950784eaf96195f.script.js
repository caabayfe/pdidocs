var Event = Packages.com.snc.commons.eventmgmt.Event;
var StringUtil = Packages.com.glide.util.StringUtil;
var JSONObject = Packages.org.json.JSONObject;
var SimpleDateFormat = Packages.java.text.SimpleDateFormat;


var TransformEvents_SAPSolman = Class.create();
TransformEvents_SAPSolman.prototype = {
    initialize: function() {},

    //This function is mandatory for MID Transform Script
    transform: function() {
        var events = [];
        var additional_info = {};
        //ms.log(messageBody);
        var jsonObjectParse = new JSONObject(messageBody);
        var jsonObject = JSON.parse(jsonObjectParse);
        var event = new Event();
        additional_info.managed_object_type = jsonObject.managed_object_type;
        additional_info.managed_object_name = jsonObject.managed_object_name;
        additional_info.client = jsonObject.resource; // SAP client
        additional_info.rating = jsonObject.rating; // SAP alert color
        additional_info.status = jsonObject.status;
        additional_info.visited = jsonObject.visited;
        additional_info.metricpath = jsonObject.metricpath;
        additional_info.xml = jsonObject.xml;
        additional_info.reasonforclosure = jsonObject.reasonforclosure;
        additional_info.sn_source_event_id = jsonObject.message_key;

        if (jsonObject.sub_objects) { //additional_info related to measured metrics

            var flattenPayload = new FlattenPayload();
            var flatPayload = flattenPayload.getFlattenPayloadWithFirstLevel(jsonObject.sub_objects);
            for (var key in flatPayload) {
                additional_info[key] = flatPayload[key];
            }
        }

        if (jsonObject.resource)
            additional_info.mandant = jsonObject.resource; // SAP Mandant

        event.setField("source", "SAP Solman");
        event.setField("severity", jsonObject.severity);
        event.setField("source_instance", jsonObject.node);
        event.setField("type", jsonObject.category); // SAP object type

        if (jsonObject.metric_name)
            event.setField("metric_name", jsonObject.metric_name);
        else
            event.setField("metric_name", jsonObject.description);

        if (additional_info.managed_object_type == "HOST" || additional_info.managed_object_type == "DBMS") {
            event.setField("resource", jsonObject.managed_object_name);
            event.setField("node", jsonObject.managed_object_name);
        } else {
            // When object Type is instance, format is [source]~[JAVA/ABAP]~[node]_[sid]_[number]
            var managed_object_parts = additional_info.managed_object_name.split('~');
            if (managed_object_parts && managed_object_parts[2]) {
                var resource = managed_object_parts[2];

                var resource_parts = resource.split('_');

                if (resource_parts[0]) {
                    var node = resource_parts[0];
                    event.setField("node", node);
                }

                if (resource_parts[1])
                    additional_info.sid = resource_parts[1];

                if (resource_parts[2])
                    additional_info.instance_number = resource_parts[2];

                event.setField("resource", resource);
            }

            if (managed_object_parts) {
                if (managed_object_parts[0])
                    additional_info.ts_type = managed_object_parts[0]; //Source

                if (managed_object_parts[1])
                    additional_info.ext_system = managed_object_parts[1]; //JAVA/ABAP
            }
        }
        //Node field exists only in payload of new transport files, Override event's node with it if exists.
        if (jsonObject.node)
            event.setField("node", jsonObject.node);

        if (jsonObject.status == "C") {

            event.setField("resolution_state", "Closing"); // set Closing for clear events
        }
        if (jsonObject.message_key)
            event.setField("message_key", jsonObject.message_key);
        else if (jsonObject.managed_object_name)
            event.setField("message_key", jsonObject.managed_object_name + jsonObject.description);

        event.setField("description", event.getField('resource') + ' - ' + jsonObject.description); // SAP alert description
        event.setField("event_class", (typeof event_class !== 'undefined' && event_class) ? event_class : jsonObject.source + "_" + jsonObject.resource); // event_class field match the Connector instance Name

        //Mid implementation
        var sapPattern = "yyyyMMddHHmmss";
        var glidePattern = "yyyy-MM-dd HH:mm:ss";

        var sapFormat = new SimpleDateFormat(sapPattern);
        var rawDate = sapFormat.parse(jsonObject.time_of_event);
        var glideFormat = new SimpleDateFormat(glidePattern);
        var time_of_event = glideFormat.format(rawDate);
        event.setField("time_of_event", '' + time_of_event);

        // Add all Additional information fields to the event
        for (var key1 in additional_info) {
            event.setField(key1, additional_info[key1]);
        }
        events[0] = event;
        // STRY55293363: populate connector tags in event additional info
        if (typeof connector_tags !== 'undefined' && connector_tags) {
            var tagPrefix = (typeof alert_tags_prefix !== 'undefined' && alert_tags_prefix) ? alert_tags_prefix : 't_';
            new ConnectorUtil().populateConnectorTagsWithAlertTagPrefix(events, connector_tags, tagPrefix);
        }
        return events;
    },
};
