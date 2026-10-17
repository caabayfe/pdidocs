var CloneUtils = Class.create();
CloneUtils.prototype = {
    initialize: function() {},

    getRowCountByTableName: function(tableName, encodedQuery) {
        return this.getRowCount(tableName, encodedQuery);
    },

    getRowCount: function(tableName, encodedQuery) {
        if (!tableName) {
            return 0;
        }
		if(tableName == 'instance') {
			if(encodedQuery)
				encodedQuery += "^source=false";
			else
				encodedQuery = "source=false";
		}
        var aggregateGr = new GlideAggregate(tableName);
        if (encodedQuery) {
            aggregateGr.addEncodedQuery(encodedQuery, true);
        }
        aggregateGr.addAggregate('COUNT');
        aggregateGr.query();
        var count = aggregateGr.next() ? aggregateGr.getAggregate('COUNT') : 0;
        return count;
    },

    type: 'CloneUtils'
};

/* Generates the default JSON for conflicts to be passed to the conflict calendar.
 * @param {<string>} <startDateTimeInUTC> - <Start Time in UTC to check for the conflicts>
 * @param {<string>} <endDateTimeInUTC> - <End Time in UTC to check for the conflicts>
 * @param {<Integer>} <slotSize> - Slot size can be any number in hrs (0.5 for 30 mins, 1 for 1 hr etc.)
 * @return {<JSON>} JSON Array - Returns the JSON array object.
 */
CloneUtils.generateDefaultJsonForConflicts = function(startDateTime, endDateTime, slotSize) {
    var defaultConlictJsonArray = [],
        defaultConlictJson = {};

    if (gs.nil(startDateTime) || gs.nil(endDateTime))
        return {};

    if (gs.nil(slotSize))
        slotSize = 1;

    var startDateTimeGdt = new GlideDateTime();
    startDateTimeGdt.setDisplayValue(startDateTime);

    var endDateTimeGdt = new GlideDateTime();
    endDateTimeGdt.setDisplayValue(endDateTime);

    while (startDateTimeGdt.getNumericValue() < endDateTimeGdt.getNumericValue()) {
        defaultConlictJson = {};
        defaultConlictJson.start = String(startDateTimeGdt.getDisplayValueInternal());
        startDateTimeGdt.addSeconds(slotSize * 3600);
        defaultConlictJson.end = String(startDateTimeGdt.getDisplayValueInternal());
        defaultConlictJson.type = 'available';
        defaultConlictJsonArray.push(defaultConlictJson);
    }

    return defaultConlictJsonArray;
};

/* Fetches the conflicts between the start date/time and end date/time
 * @param {<string>} <startDateTime> - <Start Time in user's time zone to check for the conflicts>
 * @param {<string>} <endDateTime> - <End Time in user's time zone to check for the conflicts>
 * @param {<string>} <tgtInstanceId> - <Target Instance ID >
 * @return {<JSON>} JSON Array - Returns the JSON array object.
 */
CloneUtils.getConflictsArray = function(startDateTime, endDateTime, tgtInstanceId) {
    if (gs.nil(startDateTime) || gs.nil(startDateTime) || gs.nil(tgtInstanceId) || startDateTime >= endDateTime)
        return;

    var conflictFound = false,
        currentDateTime = new GlideDateTime();

    var startDateTimeGdt = new GlideDateTime(),
        endDateTimeGdt = new GlideDateTime();

    startDateTimeGdt.setDisplayValue(startDateTime);
    endDateTimeGdt.setDisplayValue(endDateTime);

    var cloneRestService = new CloneRestService(),
        windowResult = cloneRestService.fetchCloneAvailableWindows(String(startDateTimeGdt.getValue()), String(endDateTimeGdt.getValue()), tgtInstanceId);

    if (gs.nil(windowResult) || windowResult.isError == true)
        return;

    var conflictJsonArray = CloneUtils.generateDefaultJsonForConflicts(startDateTime, endDateTime);
    if (gs.nil(conflictJsonArray) || conflictJsonArray.length == 0)
        return conflictJsonArray;

    for (var idx = 0; idx < conflictJsonArray.length; idx++) {
        conflictFound = false;
        var cloneExpectedStartTime = new GlideDateTime();
        cloneExpectedStartTime.setDisplayValue(conflictJsonArray[idx].start);
        if (cloneExpectedStartTime.getNumericValue() <= currentDateTime.getNumericValue()) {
            conflictJsonArray[idx].type = CloneConstants.calendarConstants.UNAVAILABLE;
            continue;
        }

        if (windowResult.mode == CloneConstants.calendarConstants.AVAILABLE) {
            var windows = windowResult.windows;
            for (var i = 0; i < windows.length; i++) {
                var windowStart = new GlideDateTime(windows[i].suggestedMaintenanceStartDateTimeInUTC);
                var windowEnd = new GlideDateTime(windows[i].suggestedMaintenanceEndDateTimeInUTC);
                if (cloneExpectedStartTime.getNumericValue() >= windowStart.getNumericValue() && cloneExpectedStartTime.getNumericValue() <= windowEnd.getNumericValue()) {
                    conflictJsonArray[idx].type = CloneConstants.calendarConstants.AVAILABLE;
                    if (!gs.nil(windows[i].preemptableReservations) && windows[i].preemptableReservations.length > 0) {
                        conflictJsonArray[idx].preemptedReservations = windows[i].preemptableReservations;
                    }
                    conflictFound = true;
                    break;
                }
            }
            if (!conflictFound)
                conflictJsonArray[idx].type = CloneConstants.calendarConstants.UNAVAILABLE;
        } else {
            // Legacy fallback: mark unavailable if a conflict overlaps this grid slot (unchanged logic)
            var conflictsData = windowResult.conflicts;
            for (var j = 0; j < conflictsData.length; j++) {
                var conflictStartDate = new GlideDateTime(conflictsData[j].scheduledOperationStartDateTime);
                var conflictEndDate = new GlideDateTime(conflictsData[j].scheduledOperationEndDateTime);
                if (cloneExpectedStartTime.getNumericValue() >= conflictStartDate.getNumericValue() && cloneExpectedStartTime.getNumericValue() <= conflictEndDate.getNumericValue()) {
                    conflictJsonArray[idx].type = CloneConstants.calendarConstants.UNAVAILABLE;
                    conflictFound = true;
                    break;
                }
            }
            if (!conflictFound)
                conflictJsonArray[idx].type = CloneConstants.calendarConstants.AVAILABLE;
        }
    }
    return conflictJsonArray;
};

/* Calculate the max number of clone occurrences.
 * @param maxCloneDuration (String) - Max Clone Duration (3M/2W) etc.
 * @param frequency (Integer) - 1(Weekly), 2(Bi-Weekly), 3(Monthly).
 */
CloneUtils.getMaxCloneOccurrence = function(maxCloneDuration, frequency) {
    if (gs.nil(maxCloneDuration))
        maxCloneDuration = CloneConstants.cloneOptions.DEFAULT_MAX_CLONE_DURATION;

    var maxCloneOccurrences = parseInt(maxCloneDuration.substr(0, maxCloneDuration.length - 1));
    var maxDurationSuffix = maxCloneDuration.charAt(maxCloneDuration.length - 1);
    if (maxDurationSuffix == 'M') {
        if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_WEEKLY)
            maxCloneOccurrences = (maxCloneOccurrences * 4) + 1;
        else if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_BIWEEKLY)
            maxCloneOccurrences = (maxCloneOccurrences * 2) + 1;
        else if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_MONTHLY)
            maxCloneOccurrences = maxCloneOccurrences + 1;

    } else if (maxDurationSuffix == 'W') {
        if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_WEEKLY)
            maxCloneOccurrences = maxCloneOccurrences + 1;
        else if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_BIWEEKLY)
            maxCloneOccurrences = Math.floor(maxCloneOccurrences / 2) + 1;
        else if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_MONTHLY)
            maxCloneOccurrences = Math.floor(maxCloneOccurrences / 4) + 1;

    } else if (maxDurationSuffix == 'D') {
        if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_WEEKLY)
            maxCloneOccurrences = Math.floor(maxCloneOccurrences / 7) + 1;
        else if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_BIWEEKLY)
            maxCloneOccurrences = Math.floor(maxCloneOccurrences / 14) + 1;
        else if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_MONTHLY)
            maxCloneOccurrences = Math.floor(maxCloneOccurrences / 30) + 1;
    }

    return maxCloneOccurrences;
};

/* Calculate the estimated end date of the recurring series.
 * @param requestedTime (GlideDateTime) - Current requested schedule time.
 * @param frequency (Integer) - 1(Weekly), 2(Bi-Weekly), 3(Monthly).
 * @param numOfOccurrences (Integer) - Number of Occurrences.
 */
CloneUtils.getEstimatedSeriesEndDate = function(requestedTime, frequency, numOfOccurrences) {
    var currentScheduledDate,
        estimatedSeriesEndDate,
        idx,
        estimatedSeriesEndDates = [];

    currentScheduledDate = new GlideDateTime();
    if (!gs.nil(requestedTime))
        currentScheduledDate.setDisplayValue(requestedTime); // DEF0769306: parse as session-TZ display string, not UTC-internal

    if (gs.nil(frequency) || gs.nil(numOfOccurrences) || numOfOccurrences <= 1) {
        estimatedSeriesEndDates.push({
            'value': CloneUtils.getDayDateAndTimeMsg(1, currentScheduledDate)
        });
    } else {
        estimatedSeriesEndDate = new GlideDateTime(currentScheduledDate.getValue());
        estimatedSeriesEndDates.push({
            'value': CloneUtils.getDayDateAndTimeMsg(1, estimatedSeriesEndDate)
        });
        for (idx = 2; idx <= numOfOccurrences; idx++) {
            if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_WEEKLY) // Weekly case
                estimatedSeriesEndDate.addDaysLocalTime(7);
            else if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_BIWEEKLY) // Bi-Weekly case
                estimatedSeriesEndDate.addDaysLocalTime(14);
            else if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_MONTHLY) // Monthly case
                estimatedSeriesEndDate.addDaysLocalTime(28);
            else
                break;
            estimatedSeriesEndDates.push({
                'value': CloneUtils.getDayDateAndTimeMsg(idx, estimatedSeriesEndDate)
            });
        }
    }
    return estimatedSeriesEndDates;
};

CloneUtils.getDayDateAndTimeMsg = function(index, gdtObject) {
    _dateTime = gdtObject.getDisplayValueLang("full");

    return gs.getMessage("Clone Request #{0}: {1}", [index + '', _dateTime]);
};

/* Generates the clone request for recurring clones.
 * @param parentCloneGr (GlideRecord) - Parent record for all the generated clone requests.
 */
CloneUtils.generateRecurringClones = function(parentCloneGr) {
    if (gs.nil(parentCloneGr) || gs.nil(parentCloneGr.getValue('sys_id')))
        return;

    var numOfOccurrences = parentCloneGr.getValue('occurrences');
    var frequency = parentCloneGr.getValue('clone_frequency');
    if (gs.nil(frequency) || gs.nil(numOfOccurrences) || numOfOccurrences <= 1)
        return;

    var scheduledTime = new GlideDateTime(parentCloneGr.getValue('scheduled'));
    for (idx = 2; idx <= numOfOccurrences; idx++) {
        if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_WEEKLY) // Weekly case
            scheduledTime.addDaysLocalTime(7);
        else if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_BIWEEKLY) // Bi-Weekly case
            scheduledTime.addDaysLocalTime(14);
        else if (frequency == CloneConstants.cloneOptions.CLONE_FREQUENCY_MONTHLY) // Monthly case
            scheduledTime.addDaysLocalTime(28);
        else
            break;

        CloneUtils.createRequestForRecurringClones(scheduledTime, parentCloneGr.getValue('sys_id'));
    }
};

CloneUtils.createRequestForRecurringClones = function(scheduledTime, parentCloneReqSysId) {
    var cloneReqGr = new GlideRecord(CloneConstants.tableName.CLONE_REQUEST);
    if (cloneReqGr.get(parentCloneReqSysId)) {
        cloneReqGr.setValue("state", CloneConstants.status.CLONE_STATUS_REQUESTED);
        cloneReqGr.setValue('scheduled', scheduledTime);
        cloneReqGr.setValue('parent_request_id', parentCloneReqSysId);
        cloneReqGr.setValue('clone_progress', '');
        cloneReqGr.setValue('started', '');
        cloneReqGr.setValue('completed', '');
        cloneReqGr.setValue('occurrences', '');
        cloneReqGr.setValue('clone_frequency', '');
        cloneReqGr.setValue('request_id', '');
        cloneReqGr.setValue("change_number", '');
        cloneReqGr.setValue("stage", '');
        cloneReqGr.setValue("sub_stage", '');
        cloneReqGr.setValue("stage_percent_complete", 0);
        cloneReqGr.insert();
    }
};

/*
 * Validates whether clone request can be submitted. 
 */
CloneUtils.validateAndSubmitCloneRequest = function(cloneRequestGr) {
    var validationResp = {
        isError: true,
        message: []
    };

    var cloneRestService = new CloneRestService(),
        srcInstanceId,
        srcWarVersion;

    if (gs.nil(cloneRequestGr.getValue('source_instance'))) {
        srcInstanceId = gs.getProperty('instance_id');
        srcWarVersion = gs.getProperty('glide.war');
    } else {
        srcInstanceId = cloneRequestGr.source_instance.instance_id;
        srcWarVersion = cloneRequestGr.source_instance.war_version;
    }

    var tgtInstanceGr = cloneRequestGr.target_instance.getRefRecord();
    var tgtInstanceId = tgtInstanceGr.getValue('instance_id');
    var scheduled = cloneRequestGr.getValue('scheduled');

    // Calling validation API on DC to run backend preflight checks
    validationResp = cloneRestService.validateCloneRequest(srcInstanceId, tgtInstanceId, srcWarVersion, scheduled);
    if (!gs.nil(validationResp) && validationResp.isError == true)
        return validationResp;

    validationResp.isError = false;
    cloneRequestGr.insert();

    return validationResp;
};

/*
 * Validates whether clone request can be submitted by running few basic preflight checks.
 * @param cloneProfileSysId (String) - The sys_id of the clone profile used in the clone request.
 * @param validationRules (String) - Validation rules passed by DC during STCD call.
 * @param largeTablesList (String) - Large preserver tables list passed by DC during STCD call.
 */
CloneUtils.runPreflightChecks = function(cloneProfileSysId, validationRules, largeTablesList) {
    var preserverTables = [],
        excludedTables = [],
        errorType = 'error',
        errMsg,
        preflightResp = {
            isError: true,
            message: ''
        };

    if (global.JSUtil.nil(cloneProfileSysId)) {
        var preserverGr = new GlideAggregate(CloneConstants.tableName.CLONE_DATA_PRESERVER);
        preserverGr.addAggregate('COUNT', 'table');
        preserverGr.query();
        if (!preserverGr.hasNext())
            errMsg = CloneConstants.errorMsg.EMPTY_PRESERVERS;

        while (preserverGr.next())
            preserverTables.push(preserverGr.getValue('table'));

        var exclusionGr = new GlideAggregate(CloneConstants.tableName.CLONE_DATA_EXCLUSION);
        exclusionGr.addAggregate('COUNT', 'name');
        exclusionGr.query();
        while (exclusionGr.next())
            excludedTables.push(exclusionGr.getValue('name'));

    } else {
        var profilePreserverGr = new GlideAggregate(CloneConstants.tableName.CLONE_PROFILE_PRESERVER);
        var query = profilePreserverGr.addQuery('profile', cloneProfileSysId);
        query.addOrCondition('profile.name', 'System Profile');
        profilePreserverGr.addAggregate('COUNT', 'preserver.table');
        profilePreserverGr.query();
        if (!profilePreserverGr.hasNext())
            errMsg = CloneConstants.errorMsg.EMPTY_PRESERVERS;

        while (profilePreserverGr.next())
            preserverTables.push(profilePreserverGr.getValue('preserver.table'));

        var profileExclusionGr = new GlideAggregate(CloneConstants.tableName.CLONE_PROFILE_EXCLUSION);
        query = profileExclusionGr.addQuery('profile', cloneProfileSysId);
        query.addOrCondition('profile.name', 'System Profile');
        profileExclusionGr.addAggregate('COUNT', 'exclusion.name');
        profileExclusionGr.query();
        while (profileExclusionGr.next())
            excludedTables.push(profileExclusionGr.getValue('exclusion.name'));
    }

    if (global.JSUtil.nil(errMsg))
        errMsg = CloneUtils.validateSysDbView(preserverTables);

    if (global.JSUtil.nil(errMsg)) {
        var tablesNotAllowedList = [];
        if (!gs.nil(validationRules)) {
            try {
                validationRules = JSON.parse(validationRules);
                if (Object.keys(validationRules).length != 0 && !gs.nil(validationRules.exclusionTablesBlacklistRules) &&
                    !gs.nil(validationRules.exclusionTablesBlacklistRules.tables))
                    tablesNotAllowedList = String(validationRules.exclusionTablesBlacklistRules.tables).split(",");
            } catch (e) {
                gs.error('Unable to parse validation rules.');
            }
        }

        // Validates the exclusion list against not allowed tables.
        errMsg = CloneUtils.validateExclusionTablesNotAllowed(excludedTables, tablesNotAllowedList);
    }

    if (global.JSUtil.nil(errMsg)) {
        var largeTablesListForMessage = "",
            excessCloneTime = 0;

        errorType = 'warning';

        var largeTablesInPreserver = CloneUtils.validateLargeTablesInPreserver(preserverTables, largeTablesList);
        if (!gs.nil(largeTablesInPreserver) && Object.keys(largeTablesInPreserver).length != 0) {
            for (var table in largeTablesInPreserver) {
                largeTablesListForMessage += table + ", ";
                excessCloneTime += largeTablesInPreserver[table];
            }

            largeTablesListForMessage = largeTablesListForMessage.substring(0, largeTablesListForMessage.length - 2);
            if (excessCloneTime == 0)
                errMsg = sn_i18n.Message.getMessage("sn_instance_clone", "clone.large.preserver.warning.tables", {0: largeTablesListForMessage});
            else {
                var warningMessage = sn_i18n.Message.getMessage("sn_instance_clone", "clone.large.preserver.warning.tables", {0: largeTablesListForMessage});
                errMsg = gs.getMessage("{0} by {1} minutes.", [warningMessage, excessCloneTime]);
            }
        }
    }

    if (global.JSUtil.nil(errMsg)) {
        preflightResp.isError = false;
        preflightResp.errorType = '';
        preflightResp.message = '';
    } else {
        preflightResp.isError = true;
        preflightResp.errorType = errorType;
        preflightResp.message = errMsg;
    }

    return preflightResp;
};

/*
 * Validates if there are any large tables being preserved.
 * @param preservedTables {Array} - List of tables that are being preserved.
 * @param largeTablesList {JSON} - List of tables that are large tables.
 */
CloneUtils.validateLargeTablesInPreserver = function(preservedTables, largeTablesList) {
    if (gs.nil(preservedTables) || preservedTables.length == 0 || gs.nil(largeTablesList))
        return '';

    var largeTablesInPreserver = {};
    try {
        largeTablesList = JSON.parse(largeTablesList);
        for (var idx = 0; idx < preservedTables.length; idx++) {
            var tableName = preservedTables[idx];
            if (largeTablesList.hasOwnProperty(tableName) && !(largeTablesInPreserver.hasOwnProperty(tableName)))
                largeTablesInPreserver[tableName] = largeTablesList[tableName];
        }
    } catch (e) {
        gs.error('Unable to parse large tables list.');
    }

    return largeTablesInPreserver;
};

/*
 * Validates the exclusions.
 */
CloneUtils.validateExclusion = function(current) {
    var tableName = current.getValue('name'),
        table = current.getValue('table'),
        excludedTable = [];

    if (gs.nil(tableName) && gs.nil(table))
        return false;

    var exclusionGr = new GlideRecord(CloneConstants.tableName.CLONE_DATA_EXCLUSION);
    if (!gs.nil(tableName)) {
        excludedTable.push(tableName);
        exclusionGr.addQuery('name', tableName);
    } else {
        excludedTable.push(table);
        exclusionGr.addQuery('table', table);
        exclusionGr.addQuery('condition', current.getValue('condition'));
    }

    exclusionGr.addQuery('sys_id', '!=', current.getValue('sys_id'));
    exclusionGr.query();
    if (exclusionGr.next())
        return CloneConstants.errorMsg.EXCLUSION_EXISTS;

    return CloneUtils.validateExclusionTablesNotAllowed(excludedTable);
};


/*
 * Fetches the config count for clone from either local or remote instance.
 * @param instanceUrl - The URL of the remote instance.
 * @param user - The username of the remote instance.
 * @param password - The password of the remote instance.
 * @param profileName - Profile Name
 * @return JSON Object (isError: true, message: '', exclusionCount: 0, preserverCount: 0, cleanupScriptCount: 0)
 */
CloneUtils.fetchCloneConfigurationCount = function(instanceUrl, user, password, profileName) {
    if (gs.nil(instanceUrl) || gs.nil(user) || gs.nil(password))
        return ProfileUtils.buildConfigCountFromLocalInstance(profileName);

    return ProfileUtils.buildConfigCountFromRemoteInstance(instanceUrl, user, password, profileName);
};

/*
 * Validates the exclusion against the tables that are not allowed to be excluded.
 * @param tables {Array} - List of tables that are being excluded.
 * @param tablesNotAllowedList {Array} - List of tables that are not suppose to be excluded.
 */
CloneUtils.validateExclusionTablesNotAllowed = function(tables, tablesNotAllowedList) {
    if (gs.nil(tablesNotAllowedList) || tablesNotAllowedList.length == 0) {
        tablesNotAllowedList = [];
        tablesNotAllowedList.push('sys_db_object');
        tablesNotAllowedList.push('sys_db_object.*');
    }

    if (gs.nil(tables) || !Array.isArray(tables))
        return '';

    var arrUtil = new global.ArrayUtil();
    var matchingArray = arrUtil.intersect(tablesNotAllowedList, tables);
    if (matchingArray.length == 0)
        return '';
    else
        return CloneConstants.errorMsg.EXCLUSIONS_NOT_ALLOWED + matchingArray;
};

CloneUtils.validateSysDbView = function(tables) {
    if (gs.nil(tables) || !Array.isArray(tables))
        return '';

    if (gs.tableExists("sys_db_view")) {
        while (tables.length > 0) {
            var tablesList = tables.splice(0, 30);
            var grView = new GlideRecord("sys_db_view");
            grView.addQuery('name', 'IN', tablesList);
            grView.query();
            if (grView.next())
                return CloneConstants.errorMsg.PRESERVER_DB_VIEW;
        }
    }

    return '';
};
