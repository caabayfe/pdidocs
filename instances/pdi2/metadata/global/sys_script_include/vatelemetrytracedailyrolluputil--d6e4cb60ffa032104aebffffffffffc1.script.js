var VATelemetryTraceDailyRollupUtil = Class.create();

VATelemetryTraceDailyRollupUtil.HOURLY_INTERVAL = 3599;

VATelemetryTraceDailyRollupUtil.prototype = {

    RAW_TRACES_TABLE: 'sys_cs_telemetry_trace',
    DAILY_ROLLUP_TABLE: 'sys_cs_telemetry_trace_daily',
    COLUMN_LIST : ['date', 'device_type', 'channel', 'assistant','experience', 'type', 'query_type', 'capability', 'model', 'sub_type'],
    VALUE_SEPARATOR: ':',
    EMPTY_VALUE: 'EMPTY',

    initialize: function() {
		this._modelNameToModelConfigSysIdMap = {};
    },

	/**
	 *
	 * @param {key: {DurationObject}} keyToDurationMap
	 */
	setInitialKeyToDurationMap: function(keyToDurationMap) {
		if (gs.nil(keyToDurationMap))
			this._keyToDurationDetailsMap = {};
		else {
			this._keyToDurationDetailsMap = keyToDurationMap;
		}
	},

	/**
	 * @typedef {Object} DurationObject
	 * @property {number} total_duration
	 * @property {number} count
	 */

	/**
	 * @param {string} startTimeString - UTC GlideDateTime string
	 * @param {string} endTimeString - UTC GlideDateTime string
	 * @return [{key: {DurationObject}]
	 */
    processRecordsInIntervalInclusive: function(startTimeString, endTimeString) {
		try {
			var vaTelemetryTraceList = VATelemetryTrace.getBetweenTimestamps(new GlideDateTime(startTimeString), new GlideDateTime(endTimeString));
			var vaTelemetryTrace;
			for (var j = 0; j < vaTelemetryTraceList.length; j++) {
				vaTelemetryTrace = vaTelemetryTraceList[j];
				this._processEventsInTelemetryTrace(vaTelemetryTrace);
			}
		} catch(error) {
			gs.error(this.type + ': Error rolling up telemetry data for range ' + startTimeString + ' to ' + endTimeString);
		}

       return this._getKeyToDurationObjectMap();
    },

    flush: function() {
        for (var key in this._getKeyToDurationObjectMap())
            this._insertDailyRecordForKey(key);
    },

    _insertDailyRecordForKey: function(key) {
        var columnValueList = key.split(this.VALUE_SEPARATOR);
        if (columnValueList.length != this.COLUMN_LIST.length)
            return;

        var dailyRecordGr = this._getGr(this.DAILY_ROLLUP_TABLE);
        var columnName;
        var columnValue;
        for (var i = 0; i < this.COLUMN_LIST.length; i++) {
            columnName = this.COLUMN_LIST[i];
            columnValue = columnValueList[i];
            if (columnValue === this.EMPTY_VALUE)
                continue;

            dailyRecordGr.setValue(columnName, columnValue);
        }

        // Finally take the average and set the duration value
        var durationObject = this._keyToDurationDetailsMap[key];
        if (gs.nil(durationObject))
            return;

        if (durationObject['count'] == 0)
            return;

        var averageDuration = durationObject['total_duration'] / durationObject['count'];
        dailyRecordGr.setValue('average_time', averageDuration);
        dailyRecordGr.insert();
    },

    _updateMap: function(key, duration) {
        if (gs.nil(this._keyToDurationDetailsMap[key])) {
            this._keyToDurationDetailsMap[key] = {'total_duration': duration, 'count': 1};
        } else {
            var durationDetails;
            durationDetails = this._keyToDurationDetailsMap[key];
            durationDetails.count += 1;
            durationDetails.duration += duration;
            this._keyToDurationDetailsMap[key] = durationDetails;
        }
    },

	_getModelConfigSysIdForModelName: function(modelName) {
		var configSysId;
		if (gs.nil(this._modelNameToModelConfigSysIdMap[modelName])) {
			configSysId = this._getModelConfigSysIdByModelName(modelName);
			if (!gs.nil(configSysId))
				this._modelNameToModelConfigSysIdMap[modelName] = configSysId;
		} else {
			configSysId = this._modelNameToModelConfigSysIdMap[modelName];
		}

		return configSysId;
	},

	_getModelConfigSysIdByModelName: function(modelName) {
		var genAIModelConfigGr = this._getGr('sys_generative_ai_model_config');
		genAIModelConfigGr.addQuery('model', modelName);
		genAIModelConfigGr.query();

		return genAIModelConfigGr.next() ? genAIModelConfigGr.getValue('sys_id') : null;
	},

    /**
     *
     * @param {VATelemetryTrace} vaTraceTelemetry
     * @private
     */
    _processEventsInTelemetryTrace: function(vaTraceTelemetry) {
        var traceAttributes = vaTraceTelemetry.getTraceAttributes();
        var traceDateString = gs.nil(vaTraceTelemetry.getTraceDate().getValue()) ? '' : vaTraceTelemetry.getTraceDate().getValue();
        var eventList = vaTraceTelemetry.getTraceEvents();
        for (var i = 0; i < eventList.length; i++)
            this._processEvent(traceDateString, traceAttributes, eventList[i]);
    },

    _processEvent: function(traceDateString, traceAttributes, eventJSON) {
        var key = '';
        var attributesJSON = eventJSON.attributes;
        var duration = eventJSON.duration || 0;
        var isRoot = eventJSON.isRoot;
		var eventType = attributesJSON.type.toLowerCase();
		// We process only root events for paltform, for telemetry purposes
		if (eventType === 'platform' && !isRoot)
			return;

		// We collect only those external events which has all the mandatory attributes in trace and events
		if (eventType === 'external') {
			var shouldProcessEvent = this._shouldProcessExternalEvent(traceAttributes, attributesJSON);
			if (!shouldProcessEvent)
				return;
		}

        key = this._appendValue(key, traceDateString);
        key = this._appendValue(key, traceAttributes.device_type);
        key = this._appendValue(key, traceAttributes.channel);
        key = this._appendValue(key, traceAttributes.assistant);
        key = this._appendValue(key, traceAttributes.experience);
        key = this._appendValue(key, eventType);
        key = this._appendValue(key, traceAttributes.query_type);
        key = this._appendValue(key, attributesJSON.capability);
        key = this._appendValue(key, this._getModelConfigSysIdForModelName(attributesJSON.model));
        if (isRoot) {
              // For now, we just want the first token and last token, so adding it as sub_type
            var firstTokenStart = parseFloat(attributesJSON.request_received || 0);
            var firstTokenEnd = parseFloat(attributesJSON.start_of_stream || 0);

            var lastTokenStart = parseFloat(attributesJSON.request_received || 0);
            var lastTokenEnd = parseFloat(attributesJSON.end_of_stream || 0);

            var firstTokenSent = firstTokenEnd - firstTokenStart;
            var lastTokenSent = lastTokenEnd - lastTokenStart;

            var firstTokenKey = this._appendValue(key, 'start_of_display');
            var lastTokenKey = this._appendValue(key, 'display_complete');

            this._updateMap(firstTokenKey, firstTokenSent);
            this._updateMap(lastTokenKey, lastTokenSent);
        } else {
            key = this._appendValue(key, attributesJSON.sub_type);
            this._updateMap(key, duration);
        }
    },

	_shouldProcessExternalEvent: function(traceAttributes, eventAttributes) {
		return this._mandatoryTraceAttributesPresent(traceAttributes) && this._mandatoryExternalAttributesPresent(eventAttributes);
	},

	// All the fields are mandatory to collect the metrics for external event
	_mandatoryTraceAttributesPresent: function(traceAttributes) {
		if (gs.nil(traceAttributes.device_type))
			return false;
		
		if (gs.nil(traceAttributes.channel))
			return false;

		if (gs.nil(traceAttributes.assistant))
			return false;

		if (gs.nil(traceAttributes.experience))
			return false;

		return true;
	},

	_mandatoryExternalAttributesPresent: function(attributes) {
		if (gs.nil(attributes.model))
			return false;

		if (gs.nil(attributes.capability))
			return false;

		return true;
	},

    _appendValue: function(finalValue, value) {
        if (gs.nil(value))
            value = this.EMPTY_VALUE;

        return gs.nil(finalValue) ? ('' + value) : (finalValue + this.VALUE_SEPARATOR + value);
    },

	_getKeyToDurationObjectMap: function() {
		return this._keyToDurationDetailsMap;
	},

	_getGr: function(tableName) {
		return new GlideRecord(tableName);
	},

    type: 'VATelemetryTraceDailyRollupUtil'
};

/**
 * @typedef {Object} IntervalObject
 * @property {string} startTime - GlideDateTime string of start time, in UTC
 * @property {string} endTime - GlideDateTime string of end time, in UTC
 */

/**
 * @return {*[IntervalObject]}
 */
VATelemetryTraceDailyRollupUtil.getIntervalsForYesterday = function() {
	var startTime = new GlideDateTime(gs.beginningOfYesterday());

	var intervalList = [];
	for (var i = 0; i <= 23; i++) {
		var endTime = new GlideDateTime(startTime.getValue());
		endTime.addSeconds(VATelemetryTraceDailyRollupUtil.HOURLY_INTERVAL);
		intervalList.push({startTime: startTime.getValue(), endTime: endTime.getValue()})

		startTime.addSeconds(3600);
	}

	return intervalList;
};
