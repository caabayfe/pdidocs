/**
 * ActivityTimerUtils - A utility class for managing activity timer functionality
 * Provides methods to start, stop, toggle timers and retrieve time tracking data
 * for records in ServiceNow tables.
 */
var ActivityTimerUtils = Class.create();

ActivityTimerUtils.prototype = {

	initialize: function () {
		// Table
		this.TIME_ENTRY_TABLE = 'sn_at_time_entry';
		this.SYS_USER_TABLE = 'sys_user';
		this.USER_PRESENCE_TABLE = 'sys_user_presence';
		this.AMB_CHANNEL_PRESENCE_TABLE = 'sys_amb_channel_presence';

		// Fields - User presence
		this.USER_PRESENCE_FIELD_USER = 'user';
		this.USER_PRESENCE_FIELD_UPDATED = 'sys_updated_on';

		// Fields - AMB channel presence
		this.AMB_CHANNEL_PRESENCE_FIELD_USER = 'user';
		this.AMB_CHANNEL_PRESENCE_FIELD_Glide_SESSION_ID = 'glide_session_id';
		this.AMB_CHANNEL_PRESENCE_FIELD_CHANNEL_ID = 'channel_id';

		// Fields - Time entry
		this.TIME_ENTRY_FIELD_SESSION = 'session';
		this.TIME_ENTRY_FIELD_USER = 'user';
		this.TIME_ENTRY_FIELD_TABLE = 'table';
		this.TIME_ENTRY_FIELD_RECORD = 'record';
		this.TIME_ENTRY_FIELD_TIMER_RUNNING = 'timer_running';
		this.TIME_ENTRY_FIELD_SOURCE = 'source';
		this.TIME_ENTRY_FIELD_TIMESTAMP = 'timestamp';
		this.TIME_ENTRY_FIELD_ATTRIBUTES = 'attributes';
		this.TIME_ENTRY_FIELD_TRANSACTION_ID = 'transaction_id';

		// Fields - Sys user
		this.SYS_USER_FIELD_USER_NAME = 'user_name';
		this.SYS_USER_FIELD_SYS_ID = 'sys_id';

		this.timerRunning = {
			START: '1',
			STOP: '0'
		};

		this.messageTypes = {
			TIMER_STATE_CHANGED: 'timer_state_changed',
		};
	},

	createTimerEntry: function (table, sysId, userSysId, sessionId, source, attributes, transactionId, running) {
		if (gs.nil(table) || gs.nil(sysId)|| sysId === '-1' || gs.nil(userSysId)) {
			return null;
		}

		// If create stop entry, check if the start or stop entry exists
		if (!running) {
			const latestStartTimeEntryGr = this._getLatestTimeEntry(table, sysId, userSysId, transactionId, true);
			const latestStopTimeEntryGr = this._getLatestTimeEntry(table, sysId, userSysId, transactionId, false);

			if (!latestStartTimeEntryGr || latestStopTimeEntryGr) {
				return null;
			}
		}
		
		// Create a new entry
		const gr = new GlideRecord(this.TIME_ENTRY_TABLE);

		// Set the required fields
		gr.setValue(this.TIME_ENTRY_FIELD_SESSION, sessionId || this._getSessionID());
		gr.setValue(this.TIME_ENTRY_FIELD_TABLE, table);
		gr.setValue(this.TIME_ENTRY_FIELD_RECORD, sysId);
		gr.setValue(this.TIME_ENTRY_FIELD_USER, userSysId);
		gr.setValue(this.TIME_ENTRY_FIELD_SOURCE, source || '');	//set default source to empty string
		gr.setValue(this.TIME_ENTRY_FIELD_TIMER_RUNNING, running ? this.timerRunning.START : this.timerRunning.STOP);
		gr.setValue(this.TIME_ENTRY_FIELD_TIMESTAMP, new GlideDateTime());
		//attributes must be an object or stringified JSON string
		if (!gs.nil(attributes) && attributes !== 'undefined' && attributes !== 'null' && attributes !== '{}') {
			gr.setValue(this.TIME_ENTRY_FIELD_ATTRIBUTES, typeof attributes === 'object' ? JSON.stringify(attributes) : attributes);
		} else {
			//set default attributes to empty object
			gr.setValue(this.TIME_ENTRY_FIELD_ATTRIBUTES, '{}');
		}
		gr.setValue(this.TIME_ENTRY_FIELD_TRANSACTION_ID, transactionId);

		// Insert the record
		gr.insert();

		return gr;
	},
    
	stopTimer: function (table, sysId, user) {
		const userSysId = this._getUserSysId(user);
		const lastTimeEntryGr = this._getLatestTimeEntry(table, sysId, userSysId);
		
		if (lastTimeEntryGr) {
			const sessionId = lastTimeEntryGr.getValue(this.TIME_ENTRY_FIELD_SESSION);
			const source = lastTimeEntryGr.getValue(this.TIME_ENTRY_FIELD_SOURCE);
			const attributes = lastTimeEntryGr.getValue(this.TIME_ENTRY_FIELD_ATTRIBUTES);
			const transactionId = lastTimeEntryGr.getValue(this.TIME_ENTRY_FIELD_TRANSACTION_ID);
			if (lastTimeEntryGr.getValue(this.TIME_ENTRY_FIELD_TIMER_RUNNING) === this.timerRunning.START) {
				this.createTimerEntry(table, sysId, userSysId, sessionId, source, attributes, transactionId, false);
			}
		}
	},
		
    setTimerState: function (requestArray) {
		if (!Array.isArray(requestArray) || requestArray.length === 0) {
			return [
				{
					success: false,
					message: 'Empty or invalid input requestArray.'
				}
			];
		}

		if (!gs.hasRole('sn_at.agent', 'sn_at.manager', 'sn_at.admin')) {
			return [
				{
					success: false,
					message: 'User does not have permission to set timer state.'
				}
			];
		}

		const result = [];
		if (gs.hasRole('sn_at.agent') && !gs.hasRole('sn_at.manager')) {
			// if they are just an agent, they shouldn't be able to set other user's durations
			// so we have to check every request in the array
			for (let i = 0; i < requestArray.length; i++) {
				const {table, sysId, user, source, attributes, transactionId, running} = requestArray[i];
				const sessionId = this._getSessionID();
				const userSysId = this._getUserSysId(user);
				if (gs.getUserID() === userSysId) {
					const res = this._setTimerState(table, sysId, userSysId, sessionId, source, attributes, transactionId, running);
					result.push(res);
				} else {
					result.push({
						success: false,
						message: 'User does not have permission to set timer state.'
					});
				}
			}

		} else {
			for (let i = 0; i < requestArray.length; i++) {
				const {table, sysId, user, source, attributes, transactionId, running} = requestArray[i];
				const sessionId = this._getSessionID();
				const userSysId = this._getUserSysId(user);
				const res = this._setTimerState(table, sysId, userSysId, sessionId, source, attributes, transactionId, running);
				result.push(res);
			}
		}

		return result;
	},

	_setTimerState: function (table, sysId, userSysId, sessionId, source, attributes, transactionId, running) {
		if (!gs.tableExists(table)) {
			return {
				success: false,
				message: 'Invalid table name.'
			};
		} else if (gs.nil(sysId) || sysId === '-1') {
			return {
				success: false,
				message: 'Invalid input record id.'
			};
		} else if (gs.nil(userSysId)) {
			return {
				success: false,
				message: 'Invalid input user.'
			};
		}	
		
		const result = {};

		// If running is false or undefined, create stop entry, else create start entry
		const entryGr = this.createTimerEntry(table, sysId, userSysId, sessionId, source, attributes, transactionId, running);
		if (gs.nil(entryGr)) {
			return {
				success: false,
				message: 'Failed to create stop timer entry. No corresponding start timer entry found.'
			};
		}

		// Publish the update to the AMB channel
		this._publishUpdate(
			table,
			sysId,
			{
				type: this.messageTypes.TIMER_STATE_CHANGED,
				status: running ? this.timerRunning.START : this.timerRunning.STOP,
				timestamp: this._getLocalTime(entryGr.getValue(this.TIME_ENTRY_FIELD_TIMESTAMP)),
				transactionId: entryGr.getValue(this.TIME_ENTRY_FIELD_TRANSACTION_ID),
				sessionId: entryGr.getValue(this.TIME_ENTRY_FIELD_SESSION)
			},
			gs.getUserName()
		);

		return {
			success: true,
			message: 'Timer ' + (running ? 'started' : 'stopped') + ' successfully.',
			data: {
				status: running ? this.timerRunning.START : this.timerRunning.STOP,
				timestamp: this._getLocalTime(entryGr.getValue(this.TIME_ENTRY_FIELD_TIMESTAMP)),
				attributes: JSON.parse(entryGr.getValue(this.TIME_ENTRY_FIELD_ATTRIBUTES)),
				transactionId: entryGr.getValue(this.TIME_ENTRY_FIELD_TRANSACTION_ID),
				sessionId: entryGr.getValue(this.TIME_ENTRY_FIELD_SESSION)
			}
		};
	},

	getDuration: function (table, sysId, user, source, attributes, filterQuery) {
		if (!gs.tableExists(table)) {
			return {
				success: false,
				message: 'Invalid table name.'
			};
		} else if (gs.nil(sysId)) {
			return {
				success: false,
				message: 'Invalid input record id.'
			};
		} else if (gs.nil(user)) {
			return {
				success: false,
				message: 'Invalid input user.'
			};
		}

		if (!gs.hasRole('sn_at.agent', 'sn_at.manager', 'sn_at.admin')) {
			return {
				success: false,
				message: 'User does not have permission to get duration.'
			};
		}

		if (gs.getUserName() != user && gs.hasRole('sn_at.agent') && !gs.hasRole('sn_at.manager')) {
			return {
				success: false,
				message: "User does not have permission to get other user's durations."
			};
		}

		var duration = 0;
		const userSysId = this._getUserSysId(user);

		var startGr = this._addQueryConditions(table, sysId, userSysId, source, attributes, this.timerRunning.START, filterQuery);

		if (!startGr.hasNext()) {
			return {
				duration,
				success: false,
				message: 'No time entry(s) found for the given input.',
				transactionId: '',
				sessionId: this._getSessionID(),
				timestamp: this._getLocalTime(new GlideDateTime())
			};
		}

		// Calculate the sum of duration
		var timerStatus = '';		//lastest transaction status
		var transactionId = '';		//lastest transaction id
		var sessionId = '';			//lastest session id
		var currentTimestamp = new GlideDateTime();
		while (startGr.next()) {
			var stopGr = this._getStopEntry(startGr);
			var startTimestamp = new GlideDateTime(startGr.getValue(this.TIME_ENTRY_FIELD_TIMESTAMP));
			if (stopGr) {
				timerStatus = timerStatus === '' ? stopGr.getValue(this.TIME_ENTRY_FIELD_TIMER_RUNNING) : timerStatus;
				transactionId = transactionId === '' ? stopGr.getValue(this.TIME_ENTRY_FIELD_TRANSACTION_ID) : transactionId;
				sessionId = sessionId === '' ? stopGr.getValue(this.TIME_ENTRY_FIELD_SESSION) : sessionId;
				var endTimestamp = new GlideDateTime(stopGr.getValue(this.TIME_ENTRY_FIELD_TIMESTAMP));
				duration += endTimestamp.getNumericValue() - startTimestamp.getNumericValue();
			} else {
				timerStatus = timerStatus === '' ? startGr.getValue(this.TIME_ENTRY_FIELD_TIMER_RUNNING) : timerStatus;
				transactionId = transactionId === '' ? startGr.getValue(this.TIME_ENTRY_FIELD_TRANSACTION_ID) : transactionId;
				sessionId = sessionId === '' ? startGr.getValue(this.TIME_ENTRY_FIELD_SESSION) : sessionId;
				duration += currentTimestamp.getNumericValue() - startTimestamp.getNumericValue();
			}
		}
		
		return {
			duration: parseInt(duration),
			success: true,
			timerStatus: timerStatus,
			transactionId: transactionId,
			sessionId: sessionId,
			message: 'Duration retrieved successfully.',
			timestamp: this._getLocalTime(currentTimestamp)
		};
	},

	getAudit(table, sysId, user, source, attributes, filterQuery) {
		if (!gs.tableExists(table)) {
			return [{
				success: false,
				message: 'Invalid table name.'
			}];
		} else if (gs.nil(sysId)) {
			return [{
				success: false,
				message: 'Invalid input record id.'
			}];
		} else if (gs.nil(user)) {
			return [{
				success: false,
				message: 'Invalid input user.'
			}];
		}

		if (!gs.hasRole('sn_at.manager', 'sn_at.admin')) {
			return [{
				success: false,
				message: 'User does not have permission to get audit.'
			}];
		}

		var result = [];
		const userSysId = this._getUserSysId(user);

		var startGr = this._addQueryConditions(table, sysId, userSysId, source, attributes, this.timerRunning.START, filterQuery);

		if (!startGr.hasNext()) {
			result.push({
				success: false,
				message: 'No time entry(s) found for the given input.'
			});
		}

		while (startGr.next()) {
			var stopGr = this._getStopEntry(startGr);
			var currentTimestamp = new GlideDateTime();
			var startTimestamp = new GlideDateTime(startGr.getValue(this.TIME_ENTRY_FIELD_TIMESTAMP));
			var endTimestamp = stopGr ? new GlideDateTime(stopGr.getValue(this.TIME_ENTRY_FIELD_TIMESTAMP)) : null;
			result.push({
				userId: userSysId,
				source: source,
				table: table,
				record: startGr.getValue(this.TIME_ENTRY_FIELD_RECORD),
				attributes: startGr.getValue(this.TIME_ENTRY_FIELD_ATTRIBUTES),
				transactionId: startGr.getValue(this.TIME_ENTRY_FIELD_TRANSACTION_ID),
				startTime: this._getLocalTime(startTimestamp),
				endTime: endTimestamp ? this._getLocalTime(endTimestamp) : '',
				duration: endTimestamp ? 
					parseInt(endTimestamp.getNumericValue() - startTimestamp.getNumericValue()) : 
					parseInt(currentTimestamp.getNumericValue() - startTimestamp.getNumericValue()),
			});
		}

		return result;
	},

	_getStopEntry: function (startGr) {
		if (gs.nil(startGr)) {
			return null;
		}
		const stopGr = new GlideRecord(this.TIME_ENTRY_TABLE);
		stopGr.addQuery(this.TIME_ENTRY_FIELD_TIMER_RUNNING, this.timerRunning.STOP);
		stopGr.addQuery(this.TIME_ENTRY_FIELD_TRANSACTION_ID, startGr.getValue(this.TIME_ENTRY_FIELD_TRANSACTION_ID));
		stopGr.query();
		if (stopGr.next()) {
			return stopGr;
		}
		return null;
	},

	_addQueryConditions: function (table, sysId, userSysId, source, attributes, running, filterQuery) {
		var entryGr = new GlideRecord(this.TIME_ENTRY_TABLE);

		entryGr.addQuery(this.TIME_ENTRY_FIELD_TABLE, table);
		entryGr.addQuery(this.TIME_ENTRY_FIELD_RECORD, sysId);
		entryGr.addQuery(this.TIME_ENTRY_FIELD_USER, userSysId)
		if (!gs.nil(source) && source !== 'undefined' && source !== 'null') {
			entryGr.addQuery(this.TIME_ENTRY_FIELD_SOURCE, source);
		}
		//attributes must be an object or stringified JSON string
		if (!gs.nil(attributes) && attributes !== 'undefined' && attributes !== 'null' && attributes !== '{}') {
			this._addEncodedQuery(entryGr, this.TIME_ENTRY_FIELD_ATTRIBUTES, 'CONTAINS', attributes);
		}
		if (!gs.nil(filterQuery) && filterQuery !== 'undefined' && filterQuery !== 'null') {
			entryGr.addEncodedQuery(filterQuery);
		}
		entryGr.addQuery(this.TIME_ENTRY_FIELD_TIMER_RUNNING, running ? this.timerRunning.START : this.timerRunning.STOP);
		entryGr.orderByDesc(this.TIME_ENTRY_FIELD_TIMESTAMP);
		entryGr.query();

		return entryGr;
	},

	_addEncodedQuery: function (gr, field, operator, attr) { 
		var strAttr = attr;
		if (typeof attr === 'object') {
			strAttr = JSON.stringify(attr);
		}

		var parsedAttr = JSON.parse(strAttr);
		for (var key in parsedAttr) {
			if (parsedAttr.hasOwnProperty(key)) {
				const value = parsedAttr[key];
				var query = '"' + key + '"' + ':' + '"' + value + '"';
				gr.addQuery(field, operator, query);
			}
		}
	},

	_isEmptyObject: function (obj) {
		if (typeof obj !== 'object' || obj === null) {
			return false;
		}
		return Object.keys(obj).length === 0;
	},

	_publishUpdate: function (table, sysId, payload, user) {
		const channel = this._getChannel(table, sysId);
		gs.publishToUser(channel, payload, user);
	},

	_getUserSysId: function (username) {
		const userGr = new GlideRecord(this.SYS_USER_TABLE);
		userGr.addQuery(this.SYS_USER_FIELD_USER_NAME, username);
		userGr.setLimit(1);
		userGr.query();
		if (userGr.next()) {
			return userGr.getUniqueValue();
		}
		return null;
	},

	_getUserName: function (userSysId) {
		const userGr = new GlideRecord(this.SYS_USER_TABLE);
		userGr.addQuery(this.SYS_USER_FIELD_SYS_ID, userSysId);
		userGr.setLimit(1);
		userGr.query();
		if (userGr.next()) {
			return userGr.getValue(this.SYS_USER_FIELD_USER_NAME);
		}
		return null;
	},

	_getSessionID: function () {
		return gs.getSessionID();
	},

	_getChannel: function (table, sysId) {
		return '/timer/' + table + '/' + sysId;
	},

	_getLatestTimeEntry: function (table, sysId, userSysId, transactionId, running) {
		const gr = new GlideRecord(this.TIME_ENTRY_TABLE);

		// Filter by userSysId, table, record and transactionId(optional)
		gr.addQuery(this.TIME_ENTRY_FIELD_USER, userSysId);
		gr.addQuery(this.TIME_ENTRY_FIELD_TABLE, table);
		gr.addQuery(this.TIME_ENTRY_FIELD_RECORD, sysId);
		if (!gs.nil(transactionId)) {
			gr.addQuery(this.TIME_ENTRY_FIELD_TRANSACTION_ID, transactionId);
		}
		if (!gs.nil(running)) {
			gr.addQuery(this.TIME_ENTRY_FIELD_TIMER_RUNNING, running ? this.timerRunning.START : this.timerRunning.STOP);
		}
		gr.setLimit(1);
		gr.orderByDesc(this.TIME_ENTRY_FIELD_TIMESTAMP);
		gr.query();

		// Haven't started tracking this record yet, no time to get
		if (!gr.next()) {
			return null;
		}
		return gr;
	},

	_getLocalTime: function (time) {
		const gdtTime = new GlideDateTime(time);
		return gdtTime.getLocalDate() + ' ' + gdtTime.getLocalTime().getByFormat('HH:mm:ss');
	},

	_retrieveRecentTimeEntryByEndOfYesterday: function () {
		var startEntry = new GlideRecord(this.TIME_ENTRY_TABLE);
		startEntry.addQuery(this.TIME_ENTRY_FIELD_TIMER_RUNNING, this.timerRunning.START);
		startEntry.addQuery(this.TIME_ENTRY_FIELD_TIMESTAMP, '>', 'javascript:gs.endOfYesterday()');
		startEntry.orderByDesc(this.TIME_ENTRY_FIELD_TIMESTAMP);
		startEntry.query();
		var entryMap = {};
		while (startEntry.next()) {
			stopEntry = this._getStopEntry(startEntry);
			if (!stopEntry) {
				const table = startEntry.getValue(this.TIME_ENTRY_FIELD_TABLE);
				const recordSysId = startEntry.getValue(this.TIME_ENTRY_FIELD_RECORD);
				const userSysId = startEntry.getValue(this.TIME_ENTRY_FIELD_USER);
				const sessionId = startEntry.getValue(this.TIME_ENTRY_FIELD_SESSION);
				const source = startEntry.getValue(this.TIME_ENTRY_FIELD_SOURCE);
				const attributes = startEntry.getValue(this.TIME_ENTRY_FIELD_ATTRIBUTES);
				const transactionId = startEntry.getValue(this.TIME_ENTRY_FIELD_TRANSACTION_ID);
				if (!entryMap[transactionId]) {
					entryMap[transactionId] = {
						table,
						recordSysId,
						userSysId,
						sessionId,
						source,
						attributes,
						transactionId
					};
				}
			}
		}
		return entryMap;
	},

	getAMBChannelPresence: function (userId, sessionId, table, sysId) {
		const channelPresenceGr = new GlideRecord(this.AMB_CHANNEL_PRESENCE_TABLE);
		channelPresenceGr.addQuery(this.AMB_CHANNEL_PRESENCE_FIELD_USER, userId);
		channelPresenceGr.addQuery(this.AMB_CHANNEL_PRESENCE_FIELD_Glide_SESSION_ID, sessionId);
		channelPresenceGr.addQuery(this.AMB_CHANNEL_PRESENCE_FIELD_CHANNEL_ID, this._getChannel(table, sysId));
		channelPresenceGr.query();

		if (!channelPresenceGr.next()) {
			return null;
		}
		return channelPresenceGr;
	},

	_getUserPresence: function (userId) {
		const userPresenceGr = new GlideRecord(this.USER_PRESENCE_TABLE);
		userPresenceGr.addQuery(this.USER_PRESENCE_FIELD_USER, userId);
		userPresenceGr.query();

		if (!userPresenceGr.next()) {
			return null;
		}
		return userPresenceGr.getValue(this.USER_PRESENCE_FIELD_UPDATED);
	},

	isCurrentUserInactive: function (userId) {
		const lastUpdatedTimeOfUserPresence = this._getUserPresence(userId);
		if (!lastUpdatedTimeOfUserPresence) {
			return true;
		}
		const currentTime = new GlideDateTime();
		const diff = currentTime.getNumericValue() - new GlideDateTime(lastUpdatedTimeOfUserPresence).getNumericValue();
		// 2 minutes per the default value of property 'glide.ui.active.session_timeleft'
		return diff > 120000;
	},

	sendHeartbeat: function () {	
		const startEntryMap = this._retrieveRecentTimeEntryByEndOfYesterday();
		Object.keys(startEntryMap).forEach(transactionId => {
			const startEntry = startEntryMap[transactionId];
			const table = startEntry.table;
			const userSysId = startEntry.userSysId;
			const sessionId = startEntry.sessionId;
			const recordSysId = startEntry.recordSysId;
			const source = startEntry.source;
			const attributes = startEntry.attributes;
			if (this.isCurrentUserInactive(userSysId) || !this.getAMBChannelPresence(userSysId, sessionId, table, recordSysId)) {
				const stopEntry = this.createTimerEntry(table, recordSysId, userSysId, sessionId, source, attributes, transactionId, false);
				const entryUserName = this._getUserName(userSysId);
				if (stopEntry) {
					this._publishUpdate(
						table,
						recordSysId,
						{
							type: this.messageTypes.TIMER_STATE_CHANGED,
							status: this.timerRunning.STOP,
							timestamp: this._getLocalTime(stopEntry.getValue(this.TIME_ENTRY_FIELD_TIMESTAMP)),
							transactionId: stopEntry.getValue(this.TIME_ENTRY_FIELD_TRANSACTION_ID),
							sessionId: stopEntry.getValue(this.TIME_ENTRY_FIELD_SESSION)
						},
						entryUserName
					);
				}
			}
		});
	},

	type: 'ActivityTimerUtils'
};
