var AutoResolutionResponseChannelHelper = Class.create();
AutoResolutionResponseChannelHelper.prototype = {
    initialize: function() {},

    type: 'AutoResolutionResponseChannelHelper'
};

AutoResolutionResponseChannelHelper.createResponseChannelForARConfig = function(configSysId) {
    var responseChannel = gs.getProperty(AutoResolutionConstants.RESPONSE_CHANNEL_LIST, '');
    var responseChannelList = responseChannel.split(",");
    if (!responseChannelList.length)
        return;
    var order = 100;
    var respChannelGr = new GlideRecord(AutoResolutionConstants.RESPONSE_CHANNEL_TABLE_NAME);
    for (var i = 0; i < responseChannelList.length; i++) {
        respChannelGr.initialize();
        respChannelGr.setValue("response_channel", responseChannelList[i]);
        respChannelGr.setValue("order", order * (i + 1));
        respChannelGr.setValue("active", false);
        respChannelGr.setValue("configuration", configSysId);
        respChannelGr.insert();
    }
};

AutoResolutionResponseChannelHelper.canActivateResponseChannel = function(channelGr) {
	var responseChannelName = channelGr.getValue(AutoResolutionConstants.RESPONSE_CHANNEL_FIELD_NAME);
	var logger = new AutoResolutionLoggingUtils().withName(this.type).createLogger();
	var isResponseChannelConfigured = false;
	switch (responseChannelName) {
		case AutoResolutionNotificationHelper.RESPONSE_CHANNEL.EMAIL:
			isResponseChannelConfigured = AutoResolutionResponseChannelHelper.isEmailConfiguredForResponseChannel();
			break;
		case AutoResolutionNotificationHelper.RESPONSE_CHANNEL.SMS:
			isResponseChannelConfigured = 
				AutoResolutionResponseChannelHelper.isSMSConfiguredForResponseChannel(channelGr.configuration.getRefRecord());
			break;
		case AutoResolutionNotificationHelper.RESPONSE_CHANNEL.VA:
			isResponseChannelConfigured = AutoResolutionResponseChannelHelper.isVAConfiguredForResponseChannel();
			break;
		default:
			logger.error("Response channel type does not match any of the following: Email, SMS, Virtual Agent.");
			break;
	}

	var connectionStatus = isResponseChannelConfigured 
		? AutoResolutionConstants.RESPONSE_CHANNEL_STATUS_SUCCESS
		: AutoResolutionConstants.RESPONSE_CHANNEL_STATUS_FAILURE;
	AutoResolutionResponseChannelHelper.updateResponseChannelStatus(channelGr.getUniqueValue(), connectionStatus);
	
	return isResponseChannelConfigured;
};


AutoResolutionResponseChannelHelper.updateResponseChannelStatus = function(channelSysId, status) {
    
	var respChannelGr = new GlideRecord(AutoResolutionConstants.RESPONSE_CHANNEL_TABLE_NAME);
    respChannelGr.get(channelSysId);
	
    if (respChannelGr.isValidRecord()) {
        respChannelGr.setValue("status", status);
        respChannelGr.update();
    }
};

/**
 * Check if response channel records exists for response channels in com.glide.cs.auto_resolution.response_channel_list
 * for the given configSysId
 * @param configSysId
 */
AutoResolutionResponseChannelHelper.shouldCreateResponseChannels = function(configSysId) {
    var responseChannel = gs.getProperty(AutoResolutionConstants.RESPONSE_CHANNEL_LIST, '');
    var responseChannelList = responseChannel.split(",");
    if (!responseChannelList.length)
        return false;

    var respChannelGr = new GlideRecord(AutoResolutionConstants.RESPONSE_CHANNEL_TABLE_NAME);
    respChannelGr.addQuery("configuration", configSysId);
    respChannelGr.addQuery("response_channel", "IN",  responseChannelList);
    respChannelGr.query();

    return !respChannelGr.next();
};

/**
 * Check whether a certain channel type is active for an IAR configuration
 * @param {string} configSysId, respChannelType
 * @returns {boolean}
 */
AutoResolutionResponseChannelHelper.checkActiveResponseChannelForConfig = function(configSysId, respChannelType) {
    var respChannelGr = new GlideRecord(AutoResolutionConstants.RESPONSE_CHANNEL_TABLE_NAME);
	respChannelGr.addQuery('configuration', configSysId);
	respChannelGr.addQuery('response_channel', respChannelType);
	respChannelGr.addActiveQuery();
	respChannelGr.query();

	if (respChannelGr.next()) {
		return true;
	}

	return false;
};

/**
 * Checks whether email is configured in order for the email response channel to be active
 * @returns {boolean}
 */
AutoResolutionResponseChannelHelper.isEmailConfiguredForResponseChannel = function() {
	if (gs.getProperty(AutoResolutionConstants.EMAIL_SENDING_ENABLED) === "true")
		return true;

	gs.flushMessages();
	gs.addErrorMessage(gs.getMessage("Email sending needs to be enabled to set Email as active response channel. Set property glide.email.smtp.active to true and try again."));
	return false;
};
	
/**
 * Checks whether the Notify for Twilio Direct is configured and the Notify SMS Phone field is populated 
 * on the AR Config in order for the SMS response channel to be active
 * @param {string} configTargetTableName
 * @returns {boolean}
 */
AutoResolutionResponseChannelHelper.isSMSConfiguredForResponseChannel = function(configGr) {
	if (!GlidePluginManager.isActive("com.snc.notify.twilio_direct")) {
		gs.flushMessages();
		gs.addErrorMessage(gs.getMessage("Twilio Notify plugin is required to set SMS as active response channel. Install Twilio Notify and try again."));
		return false;
	}

	if (!AutoResolutionNotificationHelper.isNotifySMSPhonePresentAndSelectedOnConfig(configGr)) {
		var notifyWithTwilioUrl = new SNC.ContextDocAPI().getURLFromName('Configure_Notify_Twilio');
		var notifyWithTwilioLink = '<a href="' + notifyWithTwilioUrl + '">' + gs.getMessage("Notify with Twilio") + '</a>';

		gs.flushMessages();
		gs.addErrorMessage(gs.getMessage("Auto-Resolution Notification Preferences should have a Notify SMS phone value. Configure {0} and try again.", notifyWithTwilioLink));
		return false;
	}
	
	return true;
};

/**
 * Checks whether the VA plugin is installed and if either the web client are active or there exists 
 * an active VA notification channel in order for the SMS response channel to be active
 * @returns {boolean}
 */
AutoResolutionResponseChannelHelper.isVAConfiguredForResponseChannel = function() {
	if (!GlidePluginManager.isActive("com.glide.cs.chatbot")) {
		gs.flushMessages();
		gs.addErrorMessage(gs.getMessage("Glide Virtual Agent plugin is required to set Virtual Agent as active response channel. Install  Glide Virtual Agent (com.glide.cs.chatbot) and try again."));
		return false;
	}
	
	if (!AutoResolutionNotificationHelper.isVANotificationEnabledOnTheInstance()) {
		var vaSettingsUrl = gs.getProperty("glide.servlet.uri") + "now/conversation/settings/virtual-agent";
		var vaSettingsLink = '<a href="' + vaSettingsUrl + '">' + gs.getMessage("Virtual Agent Settings") + '</a>';
		gs.flushMessages();
		gs.addErrorMessage(gs.getMessage("VA Notifications need to be enabled to set Virtual Agent as an active response channel. Enable VA Notifications in {0} and try again.", vaSettingsLink));
		return false;
		
	}
	
	if (!AutoResolutionNotificationHelper.isVANotificationChannelEnabled()) {		
		var messagingAppsIntegrationUrl = gs.getProperty("glide.servlet.uri") + "$bot-install-ui.do";
		var messagingAppsIntegrationLink = '<a href="' + messagingAppsIntegrationUrl + '">' + gs.getMessage("Messaging Apps Integration") + '</a>';
		
		gs.flushMessages();
		gs.addErrorMessage(gs.getMessage("VA Notification channel needs to be enabled to set Virtual Agent as an active response channel. Enable VA Notification channel in {0} and try again.", messagingAppsIntegrationLink));
		return false;
	}
	
	return true;
};
