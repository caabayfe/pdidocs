var AutoResolutionNotificationStage = Class.create();
AutoResolutionNotificationStage.prototype = Object.extendsObject(AutoResolutionTaskProcessingStage, {

	getStateValue: function() {
		return AutoResolutionConstants.TASK_PROCESSING_STATE.NOTIFICATION;
	},

	execute: function(contextFieldValueMap) {
		this.prepare(contextFieldValueMap, this.type);
		
		if (!this._validTopic()) {
			this.setError('There is no valid topic for this context');
			return this.response;
		}

		var notificationHelper = new AutoResolutionNotificationHelper(this.userId, 'sys_user', this.configGr.getUniqueValue(),
																		this.LOGGER);

		var notificationEnabled = notificationHelper.anyResponseChannelActiveForUserAndConfig();
		if (!notificationEnabled) {
			this.setError('No active response channels');
			return this.response;
		}

		var notificationShouldSendResponse = notificationHelper.shouldSendNotification();
		if (!notificationShouldSendResponse.shouldSend) {
			this.setError(notificationShouldSendResponse.reason);
			return this.response;
		}

		var emailNotificationId = this.configGr.getValue('initial_recommendation_email');
		var smsNotificationGr = notificationHelper.getSMSTemplateFromGR(this.configGr, 'initial_recommendation_sms');
		var responseChannelObjectList = notificationHelper.getResponseChannelObjectList();

		this.setContextValue('response_channels', this._getResponseChannelNameList(responseChannelObjectList));
		this.setContextValue('notification_state', 'waiting');
		this.setContextValue('notification_user', this.userId);

		var numOfChannelsToSendTo = responseChannelObjectList.length;
		if (notificationHelper.shouldSendVANotification())
			numOfChannelsToSendTo = numOfChannelsToSendTo - 1;

		var numOfChannelsSentTo = 0;
		if (notificationHelper.shouldSendEmail().shouldSend) {
			try {
				var contextID = notificationHelper.sendEmail(this.taskGr, emailNotificationId);
				if (gs.nil(contextID))
					this.LOGGER.error('Context ID returned by Flow API is null for user with sys_id={0}', this.userId);
				else
					numOfChannelsSentTo++;
			} catch (error) {
				this.LOGGER.error('Error sending initial recommendation Email to user with sys_id={0}. Error: {1}', this.userId, error);
			}
		}

		if (notificationHelper.shouldSendSMS().shouldSend) {
			try {
				var messageID = notificationHelper.sendSMS(this.taskGr.getTableName(), this.taskGr.getValue('sys_id'), smsNotificationGr);
				if (gs.nil(messageID))
					this.LOGGER.error('Message ID returned by Notify API is null for user with sys_id={0}', this.userId);
				else
					numOfChannelsSentTo++;
			} catch(error) {
				this.LOGGER.error('Error sending initial recommendation SMS to user with sys_id={0}. Error: {1}', this.userId, error);
			}
		}

		// If email and sms are the only channels to send to, we should have sent notification to at least one of them
		if (numOfChannelsSentTo === 0 && !notificationHelper.shouldSendVANotification().shouldSend) {
			this.setError('Initial recommendation notification not sent to any channels for user with sys_id=' + this.userId);
			this.setContextValue('notification_state', 'error');
		} else if(numOfChannelsSentTo === 0 && notificationHelper.shouldSendNotification().shouldSend) {
			this.LOGGER.debug('Initial recommendation may be sent to VA channel');
		}

		// Set SLA to waiting_timeout if we are using legacy SLA mechanism.
		// New SLA flow will handle its own state management
		var useSLA = this.configGr.getValue('use_sla');
		if (gs.nil(useSLA) || useSLA === '0')
			this.setContextValue('sla_state', AutoResolutionConstants.SLA_STATE.WAITING_TIMEOUT);

		return this.response;
	},

	_validTopic: function() {
		var matchedTopic = this.response.contextFieldValueMap.matched_topic;

		// Fail if there is no topic at all
		if (gs.nil(matchedTopic))
			return false;

		// AIS display topic is always ok
		if (matchedTopic === this.configGr.getValue('ais_topic'))
			return true;

		// Else, we need to check the intent_topic_state
		var intentTopicState = this.response.contextFieldValueMap.intent_topic_state;
		return intentTopicState === AutoResolutionConstants.INTENT_TOPIC_STATE.FOUND_MATCHED_TOPIC;
	},

	/**
	 *
	 * @param {ResponseChannelObject[]} responseChannelObjectList
	 * @return {string}
	 * @private
	 */
	_getResponseChannelNameList: function(responseChannelObjectList) {
		var responseChannelNameList = [];
		var responseChannelObject;
		for (var objectIndex in responseChannelObjectList) {
			responseChannelObject = responseChannelObjectList[objectIndex];
			if (responseChannelObject.shouldSend)
				responseChannelNameList.push(responseChannelObject.name);
		}
		return responseChannelNameList.join(',');
	},

	type: 'AutoResolutionNotificationStage'
});
