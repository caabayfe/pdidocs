function transform(input) {

	const ADMIN_ROLE_ID = '2831a114c611228501d4ea6c309d626d';
	const AGENT_ICON = 'headsetOutline';
	const CUSTOMER_ICON = 'userOutline';
	const CLOSED_ICON = 'checkOutline';

	const AGENT_COLOR = '#77B27B';
	const CUSTOMER_COLOR = '#0E78C4';
	const NEW_COLOR = '#EABA75';

	var table =input.table;
	var sysId = input.sysId;
	var fulfillerRole = input.fulfillerRole;

	var fulfillers = [];
	var rsConfig = new global.RibbonDataUtil().getRSConfig(table);

	if (rsConfig == null) {
		return {};
	}

	var timelineEntries = new global.RibbonDataUtil().getTimelineData(table, sysId).timelineEntries;
	var usersActiveOnRecord = new global.RibbonDataUtil().getTimelineData(table, sysId).usersActiveOnRecord;


	if (!gs.nil(fulfillerRole)) {
		// Add fulfiller role data
		var fulfillerRoles = [];
		fulfillerRoles.push("2831a114c611228501d4ea6c309d626d");
		if (!gs.nil(fulfillerRole))
			fulfillerRoles.push(fulfillerRole);
		if (timelineEntries.length > 0) {
			var userRoleRecord = new GlideRecord("sys_user_has_role");
			userRoleRecord.addQuery("user", usersActiveOnRecord);
			userRoleRecord.addQuery("role", fulfillerRoles);
			userRoleRecord.query();
			var userids = [];
			while (userRoleRecord.next()) {
				var user = {};
				user.id = userRoleRecord.user + '';
				if (userids.indexOf(user.id) < 0) {
					fulfillers.push(user.id);
					userids.push(user.id);
				}
			}
		}
	}

	var result = processTimelineEntries(timelineEntries, fulfillers, rsConfig);
	return result;

	function getFulfillerUsersAndRoles (entries, fulfillerRole) {
		var users = [];
		var i;
		for (i = 0; i < entries.length; i++) {
			if (!users.includes(entries[i].presenceUserId)) {
				users.push(entries[i].presenceUserId);
			}
		}

		var roles = [];
		roles.push(fulfillerRole);
		roles.push(ADMIN_ROLE_ID);

		return {
			userIds: users,
			roleIds: roles
		};
	}


	function processTimelineEntries (timelineEntries, fulfillers, timelineConfig) {
		var timelineData = {};
		var label, start, end, displayStartDate, displayEndDate;
		var eventMetaData = [];
		var rangeMetaData = [];

		var rsConfig = {
			requestorStates: timelineConfig.requestorStates,
			newState: timelineConfig.newState,
			closedState: timelineConfig.closedState,
			fulfillerLabel: timelineConfig.fulfillerLabel,
			callerLabel: timelineConfig.callerLabel,
			requestLabel: timelineConfig.requestLabel
		};

		var offset = _getOffset(timelineEntries);

		for (var i = timelineEntries.length - 1; i >= 0; i--) {
			var entry = timelineEntries[i];
			if (i == timelineEntries.length - 1) {
				displayStartDate = new GlideDateTime(entry.sysCreatedOn).getNumericValue() - offset;
				start = displayStartDate;
			}
			if (i == 0) {
				displayEndDate = new GlideDateTime(entry.sysCreatedOn).getNumericValue() + offset;
				end = displayEndDate;
			}

			var type = entry.type;
			var isAgent = fulfillers.includes(entry.presenceUserId);
			var eventUser = entry.sysCreatedBy;
			var change;
			var changes;
			var timestamp;
			//process state changes
			if (type && type == 'AUDIT') {
				changes = entry.auditEntries;
				if (changes && changes.length > 0) {
					for (var j = 0; j < changes.length; j++) {
						change = changes[j];
						if (change.fieldName == 'state' || change.fieldName == 'incident_state') {
							var oldTimestamp = rangeMetaData.length == 0 ? '' : rangeMetaData[rangeMetaData.length - 1].timestamp;
							timestamp = new GlideDateTime(entry.sysCreatedOn).getNumericValue();
							rangeMetaData.push(
								{
									user: eventUser,
									isAgent: isAgent,
									oldValue: change.oldValue,
									newValue: change.newValue,
									timestamp: timestamp,
									oldTimestamp: oldTimestamp,
									fieldName: change.fieldName
								}
							);
						}
					}
				}
			}

			//process comments
			if (type && type == 'JOURNAL') {
				var journal = entry.journalEntry;
				if (journal) {
					if (journal.fieldName == 'comments') {
						timestamp = new GlideDateTime(entry.sysCreatedOn).getNumericValue();
						eventMetaData.push(
							{
								user: eventUser,
								isAgent: isAgent,
								timestamp: timestamp,
								fieldName: journal.fieldName
							}
						);
					}
				}
			}
		}

		if (rangeMetaData && rangeMetaData.length > 0) {
			if (rangeMetaData[rangeMetaData.length - 1].newValue != rsConfig.closedState) {
				displayEndDate = new GlideDateTime().getNumericValue() + offset;
				end = displayEndDate;
			}
		}

		// timelineData.label = label ? label : '';
		timelineData.start = start;
		timelineData.displayStartDate = displayStartDate;
		timelineData.end = end;
		timelineData.displayEndDate = displayEndDate;
		timelineData.eventData = _processEventMeta(eventMetaData, rangeMetaData, rsConfig);
		timelineData.rangeData = _processRangeMeta(rangeMetaData, rsConfig);

		return timelineData;
	}

	function _processEventMeta(eventMetaData, rangeMetaData, rsConfig) {
		var eventMap = {};
		var eventData, events, singleEvent, name, label, labelPlural, ariaRoleButton, icon, color;

		var metaEvent, newValue, fieldName, user, timestamp, isAgent, description;
		for (var i = 0; i < eventMetaData.length; i++) {
			metaEvent = eventMetaData[i];
			fieldName = metaEvent.fieldName;
			user = metaEvent.user;
			timestamp = metaEvent.timestamp;
			isAgent = metaEvent.isAgent;

			name = isAgent ? gs.getMessage('Agent Action') : gs.getMessage('Customer Action');
			icon = isAgent ? AGENT_ICON : CUSTOMER_ICON;
			color = '';

			label = name;
			labelPlural = name;
			ariaRoleButton = false;
			description = _getStateActivityText(fieldName, newValue, rsConfig, user);

			singleEvent = {};
			singleEvent.timestamp = timestamp;
			singleEvent.description = description;
			singleEvent.data = {};

			_pushEventDataToMap(eventMap, eventData, singleEvent, name, icon, color, label, labelPlural, ariaRoleButton, events);
		}

		//add Closed event
		if (rangeMetaData && rangeMetaData.length > 0) {
			var lastRangeMetaData = rangeMetaData[rangeMetaData.length - 1];
			newValue = lastRangeMetaData.newValue;
			if (newValue == rsConfig.closedState) {
				timestamp = lastRangeMetaData.timestamp;
				fieldName = lastRangeMetaData.fieldName;
				user = lastRangeMetaData.user;

				name = gs.getMessage('{0} {1}', [rsConfig.requestLabel, rsConfig.closedState]);
				icon = CLOSED_ICON;
				color = '';
				label = name;
				labelPlural = name;
				ariaRoleButton = false;
				description = _getStateActivityText(fieldName, newValue, rsConfig, user);

				singleEvent = {};
				singleEvent.timestamp = timestamp;
				singleEvent.description = description;
				singleEvent.data = {};

				_pushEventDataToMap(eventMap, eventData, singleEvent, name, icon, color, label, labelPlural, ariaRoleButton, events);
			}
		}

		return eventMap ? Object.keys(eventMap).map(function(k){ return eventMap[k]; }) : null;
	}

	function _pushEventDataToMap(eventMap, eventData, singleEvent, name, icon, color, label, labelPlural, ariaRoleButton, events) {
		if (eventMap[name]) {
			eventMap[name].events.push(singleEvent);
		} else {
			events = [];
			events.push(singleEvent);

			eventData = {};
			eventData.name = name;
			eventData.icon = icon;
			eventData.color = color;
			eventData.label = label;
			eventData.labelPlural = labelPlural;
			eventData.ariaRoleButton = ariaRoleButton;
			eventData.events = events;

			eventMap[name] = eventData;
		}
	}

	function _processRangeMeta(rangeMetaData, rsConfig) {
		var rangeMap = {};
		var name, color, label, ariaRoleButton, ranges, rangeData;
		var metaRange, oldValue, newValue, startTimestamp, endTimestamp;

		if (!rangeMetaData || rangeMetaData.length == 0)
			return rangeMap;

		var isRangeForCustomer;

		for (var i = 0; i < rangeMetaData.length; i++) {
			metaRange = rangeMetaData[i];
			oldValue = metaRange.oldValue;
			newValue = metaRange.newValue;
			startTimestamp = metaRange.oldTimestamp;
			endTimestamp = metaRange.timestamp;
			ariaRoleButton = false;

			if (oldValue == '') continue;

			if (rsConfig.newState.includes(oldValue)) {
				name = gs.getMessage('{0}', rsConfig.newState);
				color = NEW_COLOR;
			} else {
				isRangeForCustomer = rsConfig.requestorStates.includes(oldValue);
				name = isRangeForCustomer ? gs.getMessage('Time {0}', rsConfig.callerLabel) : gs.getMessage('Time {0}', rsConfig.fulfillerLabel);
				color = isRangeForCustomer ? CUSTOMER_COLOR : AGENT_COLOR;
			}

			rangeData = {};
			rangeData.start = rangeMetaData.length > 1 ? startTimestamp : endTimestamp;
			rangeData.end = rangeMetaData.length > 1 ? endTimestamp : (new GlideDateTime().getNumericValue());
			rangeData.description = '';
			rangeData.data = {};

			_pushRangeDataToMap(rangeMap, rangeData, name, color, label, ariaRoleButton, ranges);
		}

		//if task not closed, extra range should be handled
		if (!rsConfig.closedState.includes(newValue)) {
			isRangeForCustomer = rsConfig.requestorStates.includes(newValue);
			if (rsConfig.newState.includes(newValue)) {
				name = gs.getMessage('{0}', rsConfig.newState);
				color = NEW_COLOR;
			} else {
				// isRangeForCustomer = rsConfig.requestorStates.includes(newValue);
				name = isRangeForCustomer ? gs.getMessage('Time {0}', rsConfig.callerLabel) : gs.getMessage('Time {0}', rsConfig.fulfillerLabel);
				color = isRangeForCustomer ? CUSTOMER_COLOR : AGENT_COLOR;
			}

			ariaRoleButton = false;
			rangeData = {};
			rangeData.start = endTimestamp;
			rangeData.end = new GlideDateTime().getNumericValue();
			rangeData.description = '';
			rangeData.data = {};

			_pushRangeDataToMap(rangeMap, rangeData, name, color, label, ariaRoleButton, ranges);
		}

		return rangeMap ? Object.keys(rangeMap).map(function(k) {return rangeMap[k];}).sort(_compare) : null;
	}

	function _pushRangeDataToMap(rangeMap, rangeData, name, color, label, ariaRoleButton, ranges) {
		if (!rangeMap[name]) {
			label = name;
			ranges = [];
			ranges.push(rangeData);

			rangeMap[name] = {};
			rangeMap[name].name = name;
			rangeMap[name].label = label;
			rangeMap[name].color = color;
			rangeMap[name].ariaRoleButton = ariaRoleButton;
			rangeMap[name].ranges = ranges;
		} else {
			rangeMap[name].ranges.push(rangeData);
		}
	}

	function _compare(a, b) {
		// Use toUpperCase() to ignore character casing
		const nameA = a.name.toUpperCase();
		const nameB = b.name.toUpperCase();

		var comparison = 0;
		if (nameA > nameB) {
			comparison = 1;
		} else if (nameA < nameB) {
			comparison = -1;
		}
		return comparison;
	}

	function _getStateActivityText(fieldName, stateVal, rsConfig, user) {
		if (fieldName == 'comments') return gs.getMessage('{0} commented', user);
		if (stateVal == rsConfig.newState) {
			return gs.getMessage('{0} created a new {1}', [user, rsConfig.requestLabel]);
		} else {
			return gs.getMessage('{0} moved {1} to {2}', [user, rsConfig.requestLabel, stateVal]);
		}
	}

	function _getOffset(timelineEntries) {
		if (!timelineEntries || timelineEntries.length == 0)
			return 0;

		var len = timelineEntries.length;
		var startMs = new GlideDateTime(timelineEntries[len - 1].sysCreatedOn).getNumericValue();
		var endMs = new GlideDateTime(timelineEntries[0].sysCreatedOn).getNumericValue();

		if (startMs == endMs) {
			return (new GlideDateTime().getNumericValue() - startMs) / 10;
		}

		return (endMs - startMs) / 10;
	}

}
