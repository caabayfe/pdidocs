var VATelemetryTrace = Class.create();

VATelemetryTrace.TABLE_NAME = 'sys_cs_telemetry_trace';

VATelemetryTrace.prototype = {
    /**
     *
     * @param traceId
     */
    initialize: function(traceId) {
        this.traceId = traceId;
    },

    /**
     *
     * @param {GlideDate} date
     */
    setTraceDate: function(date) {
        this.fDate = date;
    },

    /**
     *
     * @returns {GlideDate}
     */
    getTraceDate: function() {
        if (!gs.nil(this.fDate))
            return this.fDate;
    }
,
    /**
     *
     * @param traceAttributes
     */
    setTraceAttributes: function(traceAttributes) {
        this.traceAttributes = traceAttributes;
    },

    /**
     *
     * @param name
     * @param attributes
     * @param isRoot
     */
    addTraceEvent: function(name, attributes, isRoot, duration) {
        if (gs.nil(this.traceEvents))
            this.traceEvents = [];

        this.traceEvents.push({'name': name, 'attributes': attributes, 'isRoot': isRoot, 'duration': duration});
    },

    /**
     *
     * @returns {*}
     */
    getTraceAttributes: function() {
        return this.traceAttributes;
    },

    /**
     *
     * @returns {[]}
     */
    getTraceEvents: function() {
        return this.traceEvents;
    },

    type: 'VATelemetryTrace'
};

/**
 *
 * @param encodedQuery
 * @returns {*[VATelemetryTrace]}
 */
VATelemetryTrace.getByEncodedQuery = function(encodedQuery) {
    var telemetryTraceMap = {};
    var telemetryTraceGr = new GlideRecord(VATelemetryTrace.TABLE_NAME);
    if (!gs.nil(encodedQuery))
        telemetryTraceGr.addEncodedQuery(encodedQuery);
    telemetryTraceGr.query();

    var name;
    var attributes;
    var traceId;
    var isRoot;
    var duration;
    while (telemetryTraceGr.next()) {
		try {
			isRoot = telemetryTraceGr.getValue('is_root') === '1';
			name = telemetryTraceGr.getValue('name');
			attributes = JSON.parse(telemetryTraceGr.getValue('attributes'));
			traceId = telemetryTraceGr.getValue('id');
			duration = parseFloat(telemetryTraceGr.getValue('duration'));

			var traceItem;
			if (gs.nil(telemetryTraceMap[traceId])) {
				traceItem = new VATelemetryTrace(traceId);
			} else {
				traceItem = telemetryTraceMap[traceId];
			}

			_updateTraceObject(traceItem, name, attributes, isRoot, duration);

			if (isRoot) {
				var glideDateTime = new GlideDateTime(telemetryTraceGr.getValue('sys_created_on'));
				traceItem.setTraceDate(glideDateTime.getDate());
			}

			telemetryTraceMap[traceId] = traceItem;
		} catch(error) {
			gs.error('Error getting trace by encoded query: ' + error);
		}
    }

    var vaTraceItemList = [];
    for (var traceId in telemetryTraceMap)
        vaTraceItemList.push(telemetryTraceMap[traceId]);

    return vaTraceItemList;
};


/**
 *
 * @param {GlideDateTime} startTime
 * @param {GlideDateTime} endTime
 * @return {[VATelemetryTrace]}
 */
VATelemetryTrace.getBetweenTimestamps = function(startTime, endTime) {
	var telemetryTraceGr = new GlideRecord(VATelemetryTrace.TABLE_NAME);
	telemetryTraceGr.addQuery('sys_created_on', '>=', startTime.getValue());
	telemetryTraceGr.addQuery('sys_created_on', '<=', endTime.getValue());
	telemetryTraceGr.query();

	return _getTelemetryTraceItemListForGr(telemetryTraceGr);
};

/**
 *
 * @param telemetryTraceGr
 * @return {*[VATelemetryTrace]}
 * @private
 */
function _getTelemetryTraceItemListForGr(telemetryTraceGr) {
	var telemetryTraceMap = {};
	var name;
	var attributes;
	var traceId;
	var isRoot;
	var duration;
	while (telemetryTraceGr.next()) {
		try {
			isRoot = telemetryTraceGr.getValue('is_root') === '1';
			name = telemetryTraceGr.getValue('name');
			attributes = JSON.parse(telemetryTraceGr.getValue('attributes'));
			traceId = telemetryTraceGr.getValue('id');
			duration = parseFloat(telemetryTraceGr.getValue('duration'));
			var traceItem;
			if (gs.nil(telemetryTraceMap[traceId])) {
				traceItem = new VATelemetryTrace(traceId);
			} else {
				traceItem = telemetryTraceMap[traceId];
			}

			_updateTraceObject(traceItem, name, attributes, isRoot, duration);

			if (isRoot) {
				var glideDateTime = new GlideDateTime(telemetryTraceGr.getValue('sys_created_on'));
				traceItem.setTraceDate(glideDateTime.getDate());
			}

			telemetryTraceMap[traceId] = traceItem;
		} catch(error) {
			gs.error('Error getting telemetry trace list: ' + error);
		}
	}

	var vaTraceItemList = [];
	for (var traceId in telemetryTraceMap)
		vaTraceItemList.push(telemetryTraceMap[traceId]);

	return vaTraceItemList;
}

function _updateTraceObject(vaTelemetryTrace, name, attributes, isRoot, duration) {
    if (isRoot)
        vaTelemetryTrace.setTraceAttributes(attributes);

    vaTelemetryTrace.addTraceEvent(name, attributes, isRoot, duration);
}
