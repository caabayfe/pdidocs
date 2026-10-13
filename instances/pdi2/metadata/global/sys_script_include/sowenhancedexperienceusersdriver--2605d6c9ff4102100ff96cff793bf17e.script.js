var SOWEnhancedExperienceUsersDriver = Class.create();
SOWEnhancedExperienceUsersDriver.prototype = {
    initialize: function() {
        var instanceUrl = gs.getProperty('glide.servlet.uri');
        var alertAutoLinkTemplate = '<a href="' + instanceUrl + 'now/sow/alert-automation/params/list/MODULE_NAME' + '">new Alert Automation</a>';
		var groupAlertLink = '<a href="' + instanceUrl + 'now/sow/alert-automation/params/list/group' + '">new alert grouping experience</a>';

        this.SOW_LINKS = {
            MODULE: {
                EVENT_RULES: alertAutoLinkTemplate.replace('MODULE_NAME', 'enrich'),
                TAG_BASED_CLUSTERING: groupAlertLink,
                EXPRESS_LIST: '<a href="' + instanceUrl + 'now/sow/express-list' + '">Express List</a>',
            },
            ALERT_AUTO_STORE: '<a href="' + instanceUrl + 'now/app-manager/home/app/id/65038d85c3d63110d1bdf2ff050131b4' + '">new Alert Automation</a>',
			ALERT_GROUPING_STORE: '<a href="' + instanceUrl + 'now/app-manager/home/app/id/65038d85c3d63110d1bdf2ff050131b4' + '">new alert grouping experience</a>',
            ALERT_AUTO_DOC_PAGE: '<a href="/api/now/v1/context_doc_url/group-alert-sow-itom" target="_blank">Learn more</a>',
            EXPRESS_LIST_DOC_PAGE: '<a href="/api/now/v1/context_doc_url/express-list" target="_blank">demo and learn more</a>',
        };
    },

    getNewEventRuleReferralMsg: function() {
        return this.getNewAlertAutomationReferralMsg(this.SOW_LINKS.MODULE.EVENT_RULES);
    },

    getNewTagBasedAlertClusteringReferralMsg: function() {

		var alertAutoInstalledMsg = gs.getMessage("A <b>{0}</b> is available in Service Operations Workspace, featuring advanced capabilities and a more intuitive UI. <b>{1}</b>.", [this.SOW_LINKS.MODULE.TAG_BASED_CLUSTERING, this.SOW_LINKS.ALERT_AUTO_DOC_PAGE]);
        var alertAutoNotInstalledMsg = gs.getMessage("A <b>{0}</b> is available in Service Operations Workspace, featuring advanced capabilities and a more intuitive UI. <b>{1}</b>.", [this.SOW_LINKS.ALERT_AUTO_STORE, this.SOW_LINKS.ALERT_AUTO_DOC_PAGE]);

        if (GlidePluginManager.isActive('sn_sow_alert_auto'))
            return alertAutoInstalledMsg;
        else
            return alertAutoNotInstalledMsg;
    },

    getNewAlertAutomationReferralMsg: function(sowLink) {
        var alertAutoInstalledMsg = gs.getMessage("A simpler experience is available in the <b>{0}</b> module in Service Operations Workspace. {1}.", [sowLink, this.SOW_LINKS.ALERT_AUTO_DOC_PAGE]);
        var alertAutoNotInstalledMsg = gs.getMessage("A simpler experience is available in the <b>{0}</b> module in Service Operations Workspace. {1}.", [this.SOW_LINKS.ALERT_AUTO_STORE, this.SOW_LINKS.ALERT_AUTO_DOC_PAGE]);

        if (GlidePluginManager.isActive('sn_sow_alert_auto'))
            return alertAutoInstalledMsg;
        else
            return alertAutoNotInstalledMsg;
    },

    getExpressListReferralMsg: function() {
        return gs.getMessage("Have you tried the <b>{0}</b> on Service Operations Workspace? It allows an easy and live visualization of the alerts. Watch the {1}.", [this.SOW_LINKS.MODULE.EXPRESS_LIST, this.SOW_LINKS.EXPRESS_LIST_DOC_PAGE]);
    },

    type: 'SOWEnhancedExperienceUsersDriver'
};
