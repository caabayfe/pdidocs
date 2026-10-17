(function executeRule(current, previous /*null when async*/ ) {

    if (JSUtil.nil(current.idle_since))
        return null;

    var timeoutEnabled = gs.getProperty('mid.inactivity.timeout.enabled');
    if (JSUtil.nil(timeoutEnabled) || timeoutEnabled == 'false')
        return null;

    var timeout = -1;
    var ea = new GlideRecord('ecc_agent_config');
    ea.addQuery('ecc_agent', current.sys_id);
    ea.addQuery('param_name', 'mid.inactivity.timeout.days');
    ea.addNotNullQuery('value');
    ea.query();
    if (ea.next())
        timeout = ea.value;

    if (JSUtil.nil(timeout) || isNaN(timeout) || timeout.indexOf(".") !== -1 || parseInt(timeout, 10) < 0) {
        gs.debug("MID config parameter mid.inactivity.timeout.days value: " + timeout + " is not a non-negative integer. Attempting to use system property.");

        timeout = gs.getProperty('mid.inactivity.timeout.days');
        if (JSUtil.nil(timeout) || isNaN(timeout) || timeout.indexOf(".") !== -1 || parseInt(timeout, 10) < 0) {
            gs.debug("System property mid.inactivity.timeout.days value: " + timeout + " is not a non-negative integer. Setting timeout period to 30 days.");
            // Default 30 days timeout period
            timeout = 30;
        }
    }

    timeout = parseInt(timeout, 10);
	if(timeout === 0) {
		// 0 indicates auto-invalidation feature is disabled for this MID and notification should not be shown
		return null;
	}

    // expiryDateTime = idle_since + timeout
    var expiryDateTime = new GlideDateTime(current.idle_since);
    expiryDateTime.addDaysUTC(timeout);
    var sevenDaysBeforeExpiration = new GlideDateTime(expiryDateTime);
    sevenDaysBeforeExpiration.addDaysUTC(-7);
    var threeDaysBeforeExpiration = new GlideDateTime(expiryDateTime);
    threeDaysBeforeExpiration.addDaysUTC(-3);
    var now = new GlideDateTime();

    var moreInfoI18n = gs.getMessage('More Info');
    var mip = ' <a target="_blank" href="' + gs.getProperty('help.base.servicenow') + 'CSHelp:available-system-properties' + '">' + moreInfoI18n + '</a>';
    var msgI18nExpiring = gs.getMessage('MID Server will be auto-invalidated on {0} due to inactivity.', expiryDateTime.getDisplayValue());
    var msgI18nExpired = gs.getMessage('MID Server was auto-invalidated on {0} due to inactivity.',
        !JSUtil.nil(current.invalidated_at) ? current.invalidated_at.getDisplayValue() : expiryDateTime.getDisplayValue());
    var msgI18nExpiredSoon = gs.getMessage('MID Server exceeded inactivity timeout on {0} and will be auto-invalidated soon.', expiryDateTime.getDisplayValue());

    if (now.onOrAfter(sevenDaysBeforeExpiration) && now.onOrBefore(threeDaysBeforeExpiration))
        gs.addInfoMessage(msgI18nExpiring + mip);
    else if (now.onOrAfter(threeDaysBeforeExpiration) && now.onOrBefore(expiryDateTime))
        gs.addErrorMessage(msgI18nExpiring + mip);
    else if (now.after(expiryDateTime)) {
        if (current.auto_invalidated)
            gs.addErrorMessage(msgI18nExpired + mip);
        else
            gs.addErrorMessage(msgI18nExpiredSoon + mip);
    }

})(current, previous);
