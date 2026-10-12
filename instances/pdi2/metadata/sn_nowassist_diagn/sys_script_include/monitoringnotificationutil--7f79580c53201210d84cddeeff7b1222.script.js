var MonitoringNotificationUtil = Class.create();
MonitoringNotificationUtil.prototype = {

	/**
	 * This method sets the logging context and optionally ties the instance to a sn_nowassist_monitor_execution
	 * record
	 * 
	 * @param {object} [context] - the logging context
	 * @param {string} context.execution - the sysId of the sn_nowassist_diagn_monitor_execution record to tie this object * to
	 */
    initialize: function(context) {
		if (context && context.execution && this._validateExecution(context.execution)) {
			this._updateExecution(context.execution);
		} else {
			this.LOGGER = MonitoringNotificationUtil.getLogger();
		}
    },

	/**
	 * This method creates an sn_nowassist_diagn_monitor_execution record based on previous execution history
	 * 
	 * @return {object} An object in the following format:
	 * 	{
	 * 		execution: sysId of the created record,
	 * 		startingFrom: the starting timestamp of this monitoring execution
	 *  	endingAt: the ending timestamp of this monitoring execution
	 * 	}
	 *  or null if the record insertion failed
	 */
	createMonitorExecutionRecord: function () {
		const monitorFrom = this._getLastExecutionTimestamp();
		const monitorTo = new GlideDateTime().toString();
		const execGr = new GlideRecord('sn_nowassist_diagn_monitor_execution');
		execGr.setValue('monitor_from', monitorFrom);
		execGr.setValue('monitor_to', monitorTo);
		const execution = execGr.insert();
		if (execution) {
			this._updateExecution(execution);
			return {
				execution,
				startingFrom: monitorFrom,
				endingAt: monitorTo
			};
		} else {
			return null;
		}
	},

	/**
	 * This method is the driver for the scheduled job generating notifications
	 * - It creates a monitor execution record
	 * - Fetches all active monitor configs
	 * - Evaluates conditions
	 * - Sends notifications
	 */
	generateNotifications: function () {
		const executionDetails = this.createMonitorExecutionRecord();
		const logger = this.LOGGER;
		if (!executionDetails) {
			logger.error(`${MonitoringNotificationUtil.LOG_PREFIX} Failed to create monitor execution record. Aborting notification generation`);
			return;
		}
		const startTime = new GlideDateTime();
		logger.info(`${MonitoringNotificationUtil.LOG_PREFIX} Checking for potential Now Assist Troubleshooting notificaitons`);
		const logObj = this._getAllActiveMonitorConfigsGroupedByLog();
		if (Object.keys(logObj).length > 0) {
			this.sendNotificationsFor(logObj, executionDetails.startingFrom, executionDetails.endingAt);
		} else {
			logger.info(`${MonitoringNotificationUtil.LOG_PREFIX} No active monitor configs found`);
		}
		
		const endTime = new GlideDateTime();
		logger.info(`${MonitoringNotificationUtil.LOG_PREFIX} Scheduled job ending. TIme taken: ${GlideDateTime.subtract(startTime, endTime).getNumericValue()} ms`);
	},

	/**
	 * This method fetches all active sn_nowassist_diagn_monitor_config records
	 * 
	 * @return GlideRecord for sn_nowassist_diagn_monitor_config with the configs already queried
	 * or null if there are no active queries
	 */
	getAllActiveMonitorConfigs: function () {
		const monitorConfigGr = new GlideRecord('sn_nowassist_diagn_monitor_config');
		monitorConfigGr.addActiveQuery();
		monitorConfigGr.addQuery('monitor_group.active', true);
		monitorConfigGr.query();
		return monitorConfigGr.hasNext() ? monitorConfigGr : null;
	},

	/**
	 * This method fires off the sn_nowassist_diagn.send_notifications action which
	 * evaluates all the monitoring configs for a given log and sends out notifications if there's
	 * a matching record
	 * @param logObj - an array of objects in the following format:
	 * 	{
	 * 		<log_table>: {
	 * 			errorConfigs: [{
	 * 				configId: the sn_nowassist_diagn_monitor_config id
	 * 				condition: the condition that must be matched to send a notification
	 * 				subject: the subject of the notification
	 * 				message: the message of the notification
	 * 				recipients: [{
	 * 					type: the type of notification (email/next_experience)
	 * 					user: the sysId of the sys_user who will receive the record
	 * 				}]
	 * 				matches: [] // this is a placeholder to store the records that match the provided condition
	 * 				min_count: the minimum number of records that must match the condition to trigger notification
	 * 			}]
	 * 		}
	 * 	}
	 * @param startingFrom - the starting monitoring timestamp
	 * @param endingAt - the ending monitoring timestamp
	 */
	sendNotificationsFor: function (logObj, startingFrom, endingAt) {
		for (const [log, configs] of Object.entries(logObj)) {
			const flowAction = sn_fd.FlowAPI.getRunner()
				.action('sn_nowassist_diagn.send_notifications')
				.inBackground()
				.withInputs({ log, configs: JSON.stringify(configs), startingfrom: startingFrom, endingat: endingAt, execution: this.execution })
				.run(); 
		}
	},

	/**
	 * This method constructs a url to the records matched by a monitor config
	 * @param {object} urlContext - An object in the followin format:
	 * 	{
	 * 		type: the url type (list or record view)
	 * 		table: the table that the url is for
	 * 		query: the query to be used for the list view
	 * 		sysId: the sysId to be used for record view
	 * 	}
	 * @return {string} - a url for the provided context object or null if there is an error
	 */
	constructURL: function (urlContext) {
		const instanceUrl = gs.getProperty('glide.servlet.uri');
		try {
			if (urlContext.type === MonitoringNotificationUtil.URL_TYPE_LIST) {
			return encodeURI(`${instanceUrl}${urlContext.table}_list.do?sysparm_query=${urlContext.query}`);
			} else {
				return encodeURI(`${instanceUrl}${urlContext.table}.do?sys_id=${urlContext.sysId}`);
			}
		} catch (error) {
			this.LOGGER.error(`${MonitoringNotificationUtil.LOG_PREFIX} Failed to encode URL to matching records`);
			return null;
		}
	},

	/**
	 * This method creates an sn_nowassist_diagn_monitor_notification record
	 * 
	 * @param execution - the sn_nowassist_diagn_monitor_execution sysId
	 * @param monitorConfig - the sn_nowassist_diagn_monitor_config sysId
	 * @param url - a url to the matching records that triggered the notification
	 * @param subject - the subject for the notification to be sent
	 * @param message - the message for the notification to be sent
	 * @param type - the type of the notification to be sent (sys_email/next_experience)
	 * @param user - the sysId of the sys_user the notification must be sent to
	 */
	createNotificationRecord: function (execution, monitorConfig, url, subject, message, type, user) {
		subject = MonitoringNotificationUtil.localize(subject, user);
		message = MonitoringNotificationUtil.localize(message, user);
		const notificationGr = new GlideRecord('sn_nowassist_diagn_monitor_notification');
		notificationGr.setValue('monitor_execution', execution);
		notificationGr.setValue('monitor_config', monitorConfig);
		notificationGr.setValue('matched_records', url);
		notificationGr.setValue('notification_subject', subject);
		notificationGr.setValue('notification_message', message);
		notificationGr.setValue('notification_type', type);
		notificationGr.setValue('recipient', user);
		if (!notificationGr.insert()) {
			this.LOGGER.error(`${MonitoringNotificationUtil.LOG_PREFIX} Failed to insert notification for recipient ${user} and monitor config ${monitorConfig}`);
		}
	},

	/**
	 * This method evaluates record in the provided log in the provided time range for the given monitor configs
	 * 
	 * @param log - the table that must be evaluated
	 * @param {object} configs - An object in the following format:
	 * 	{
	 * 		errorConfigs: [{
	 *			configId: the sysId of the sn_nowassist_diagn_monitor_config record
	 *			condition: the monitor config record condition that must be evaluated
	 *			min_count: the minimum number of matching records that must exist to trigger a notification
	 *			subject: the subject of the notification
	 *			message: the message of the notification
	 *			recipients: [{
	 *				type: the type of notification to be sent
	 *				user: the sys_user sysId that the notification must be sent to
	 * 			}]
	 *			matches: []
	 *		}]
	 * 	}
	 * @return an array of config objects filtered to only include configs that either 
	 * 	surpass their corresponding min_count
	 */
	evaluateConditionsFor: function (log, configs, startingFrom, endingAt) {
		let errorConfigs = configs.errorConfigs;
		const logGr = new GlideRecordSecure(log);
		logGr.addQuery('sys_created_on', '>=', startingFrom);
		logGr.addQuery('sys_created_on', '<', endingAt);
		logGr.query();
		while (logGr.next()) {
			for (const config of errorConfigs) {
				const filter = new GlideFilter(config.condition, 'filterCondition');
				if (filter.match(logGr, true)) {
					config.matches.push(logGr.getUniqueValue());
					break;
				}
			}
		}
		errorConfigs = errorConfigs.filter((config) => {
			return config.matches.length >= config.min_count;
		});
		return errorConfigs;
	},

	_updateExecution: function (execution) {
		this.execution = execution;
		this.LOGGER = MonitoringNotificationUtil.getLogger({ execution });
	},

	_validateExecution: function (execution) {
		const execGr = new GlideRecord('sn_nowassist_diagn_monitor_execution');
		return execGr.get(execution);
	},

	_isNotInBufferPeriod: function (duration, configId) {
		duration = new GlideDateTime(duration);
		const notificationGr = new GlideRecord('sn_nowassist_diagn_monitor_notification');
		notificationGr.addQuery('monitor_config', configId);
		notificationGr.orderByDesc('sys_created_on');
		notificationGr.setLimit(1);
		notificationGr.query();
		if (notificationGr.next()) {
			const latestNotificationCreated = new GlideDateTime(notificationGr.getValue('sys_created_on'));
			return new GlideDateTime().getNumericValue() - latestNotificationCreated.getNumericValue() > duration.getNumericValue();
		} else {
			return true;
		}
	},

	_getAllActiveMonitorConfigsGroupedByLog: function () {
		const logObj = {};
		const monitorConfigGr = this.getAllActiveMonitorConfigs();
		if (monitorConfigGr) {
			while (monitorConfigGr.next()) {
				if (this._isNotInBufferPeriod(monitorConfigGr.getValue('min_notification_buffer'), monitorConfigGr.getUniqueValue())) {
					const log = monitorConfigGr.getValue('log');
					const configObj = this._constructConfigObj(monitorConfigGr);
					if (configObj.recipients) {
						if (!logObj[log]) {
							logObj[log] = {
								errorConfigs: [],
							};
						}
						logObj[log].errorConfigs.push(configObj);
					} else {
						this.LOGGER.info(`${MonitoringNotificationUtil.LOG_PREFIX} No recipients found for monitor config: ${monitorConfigGr.getUniqueValue()}`);
					}
				} else {
					this.LOGGER.info(`${MonitoringNotificationUtil.LOG_PREFIX} Monitor config: ${monitorConfigGr.getDisplayValue()} is in buffer period. Skipping evaluation`);
				}
			}
		} else {
			this.LOGGER.info(`${MonitoringNotificationUtil.LOG_PREFIX} No active monitor configs found`);
		}
		
		return logObj;
	},

	_constructConfigObj: function (monitorConfigGr) {
		return {
			configId: monitorConfigGr.getUniqueValue(),
			condition: monitorConfigGr.getValue('trigger_condition'),
			min_count: monitorConfigGr.getValue('min_count'),
			subject: monitorConfigGr.getValue('notification_subject'),
			message: monitorConfigGr.getValue('notification_message'),
			recipients: this._getRecipientsFor(monitorConfigGr.getUniqueValue()),
			matches: []
		};
	},

	_getRecipientsFor: function (monitorConfigId) {
		const recipients = [];
		const m2mGr = new GlideRecord('sn_nowassist_diagn_monitor_m2m_notification');
		m2mGr.addQuery('monitor_config', monitorConfigId);
		m2mGr.query();
		while (m2mGr.next()) {
			const notificationGr = m2mGr.notification_config.getRefRecord();
			const users = notificationGr.getValue('recipients');
			if (users) {
				users.split(',').forEach((user) => {
					recipients.push({
						type: notificationGr.getValue('notification_type'),
						user
					});
				});
			}
		}
		return recipients;
	},

	_getLastExecutionTimestamp: function () {
		const execGr = new GlideRecord('sn_nowassist_diagn_monitor_execution');
		execGr.orderByDesc('sys_created_on');
		execGr.setLimit(1);
		execGr.query();
		if (execGr.next()) {
			const lastExec = new GlideDateTime(execGr.getValue('monitor_to'));
			const dayAgo = new GlideDateTime();
			dayAgo.addDaysUTC(-1);
			if (lastExec.getNumericValue() < dayAgo.getNumericValue()) {
				this.LOGGER.info(`${MonitoringNotificationUtil.LOG_PREFIX} Previous execution too far in the past. Enforcing upper bound of 1 day`);
				return dayAgo.toString();
			} else {
				return lastExec.toString();
			}
		} else {
			this.LOGGER.info(`${MonitoringNotificationUtil.LOG_PREFIX} No previous execution found. Applying monitor conditions to last 5 minutes`);
			const fallbackTimestamp = new GlideDateTime();
			fallbackTimestamp.addSeconds(MonitoringNotificationUtil.FIVE_MINUTES_AGO);
			return fallbackTimestamp.toString();
		}
	},

    type: 'MonitoringNotificationUtil'
};

MonitoringNotificationUtil.SCHEDULED_JOB = '99e2075453201210d84cddeeff7b1257';
MonitoringNotificationUtil.URL_MESSAGE = gs.getMessage('You can find the records that triggered this notification <a href="{0}">here</a>.');
MonitoringNotificationUtil.LOG_PREFIX = '[Monitor execution: {execution}]';
MonitoringNotificationUtil.URL_TYPE_LIST = 'list';
MonitoringNotificationUtil.URL_TYPE_RECORD = 'record';
MonitoringNotificationUtil.DEFAULT_LANGUAGE = gs.getProperty('glide.sys.language');
MonitoringNotificationUtil.FIVE_MINUTES_AGO = -300;

/**
 * This method is used in reference qualifiers to restrict the possible notification types
 * 
 * @return GlideChoiceList with possible options
 */
MonitoringNotificationUtil.getNotificationTypes = function () {
	const choiceList = new GlideChoiceList();

	const notificationTypes = [
		{ value: 'email', label: 'Email' },
		{ value: 'next_experience', label: 'Next Experience' },
	];

	notificationTypes.forEach((type) => {
		choiceList.add(type.value, type.label);
	});
	
	return choiceList;
};

/**
 * This method is used in reference qualifiers to restrict the possible notification types
 * 
 * @return GlideChoiceList with possible options
 */
MonitoringNotificationUtil.getNotificationTypes = function () {
	const choiceList = new GlideChoiceList();

	const notificationTypes = [
		{ value: 'email', label: 'Email' },
		{ value: 'next_experience', label: 'Next Experience' },
	];

	notificationTypes.forEach((type) => {
		choiceList.add(type.value, type.label);
	});
	
	return choiceList;
};

/**
 * This method localizes a string according to the passed user's preferred language
 * 
 * @param text - the string to be localized
 * @param user - the sysId of the sys_user the text is intended for
 * @param [args] - any arguments that must be applied to the given text to generate the message
 * 
 * @return {string} - the localized text
 */
MonitoringNotificationUtil.localize = function (text, user, args) {
	const userGr = new GlideRecord('sys_user');
	if (userGr.get(user)) {
		let language = userGr.getValue('preferred_language');
		language = language ? language : MonitoringNotificationUtil.DEFAULT_LANGUAGE;
		if (args) {
			return gs.getMessageLang(text, language, args);
		} else {
			return gs.getMessageLang(text, language);
		}
	} else {
		return text;
	}
};

/**
 * This method identifies if the provided GR is a duplicate (along some finite set of fields)
 * of another record already in the table
 * 
 * @param table - the table to be queries
 * @param newGr - the GlideRecord that must be verified
 * @param {array} fields - a string array of field names that the provided record must be checked against
 * 
 * @return - true if there is a record in the table already with exactly the same values as the provided record
 * 			 along the given set of fields 
 */
MonitoringNotificationUtil.isDuplicate = function (table, newGr, fields) {
	const gr = new GlideRecordSecure(table);
	fields.forEach((field) => {
		gr.addQuery(field, newGr.getValue(field));
	});
	gr.query();
	if (gr.next()) {
		return gr.getUniqueValue() !== newGr.getUniqueValue();
	} else {
		return false;
	}
};

/**
 * This method provides a logger
 * 
 * @return - a GlideLogger
 */
MonitoringNotificationUtil.getLogger = function (loggingContext) {
	if (loggingContext) {
		return new sn_log.GlideLogger('sn_nowassist_diagn.monitor', loggingContext, Object.keys(loggingContext));
	} else {
		return new sn_log.GlideLogger('sn_nowassist_diagn.monitor');
	}
};

/**
 * This method associates a monitor notification with its corresponding platform notification execution
 * 
 * @param notificaitonId - the sysId for the snnowassist_diagn_monitor_notification record
 * @param executionTable - the documentId table for the notification record
 * @param executionId - the documentId sysId for the notification record
 */
MonitoringNotificationUtil.updateNotificationWithExecution = function (notificationId, executionTable, executionId) {
	const logger = MonitoringNotificationUtil.getLogger();
	const notificationGr = new GlideRecord('sn_nowassist_diagn_monitor_notification');
	if (notificationGr.get(notificationId)) {
		notificationGr.setValue('notification_execution_table', executionTable);
		notificationGr.setValue('notification_execution', executionId);
		if (!notificationGr.update()) {
			logger.error(`Failed to update execution for notification id: ${notificationId}`);
		}
	} else {
		logger.error(`Failed to find notification id (${notificationId}) to associate execution from table ${executionTable} (sysId: ${executionId})`);
	}
};
