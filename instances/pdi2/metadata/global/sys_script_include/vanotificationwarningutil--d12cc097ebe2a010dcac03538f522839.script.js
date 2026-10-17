var VANotificationWarningUtil = Class.create();
VANotificationWarningUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    showWarningIfUsersExceed: function() {
		var sysUserCount = 0;
		var notificationName = '';
		var notificationId = this.getParameter('notificationId');
		
		var fromAdditionalRecipient = this.getParameter('fromAdditionalRecipient');
		
		if (fromAdditionalRecipient) {
			var gr = new GlideRecord('sys_notification');
			gr.get(notificationId);
			
			var recipientUsers = gr.getValue('recipient_users');
			var recipientUsersCount = recipientUsers ? recipientUsers.split(',').length : 0;
			var recipientFields = gr.getValue('recipient_fields');
			var recipientFieldsCount = recipientFields ? recipientFields.split(',').length : 0;
			
			sysUserCount = recipientUsersCount + recipientFieldsCount;
			notificationName = gr.getValue('name');
		} else {
			var sysUserCountParam = this.getParameter('sysUserCount');
			sysUserCount = sysUserCountParam ? parseInt(sysUserCountParam) : 0;
			notificationName = this.getParameter('notificationName');
		}
	
		var userLimit = Math.min(parseInt(gs.getProperty('com.glide.cs.per_notification_user_limit', 1000)), 10000);

        if (sysUserCount > userLimit) {
            gs.addInfoMessage(gs.getMessage(
					"The number of users in the notification '{0}' exceeds the maximum limit. Update the notification recipient to less than {1}. {2}",
					[GlideStringUtil.escapeHTML(notificationName), GlideStringUtil.escapeHTML(userLimit.toString()), this._getDocLinkForResource('config-va-notifications')]));
			return;
        }
		
        var nonSysUserCount = 0;
		if (fromAdditionalRecipient) {
			var recordActive = this.getParameter('recordActive');
			if (recordActive == 'true') {
				nonSysUserCount += this._getNonSysUserCount(this.getParameter('recipients'), this.getParameter('condition'), this.getParameter('recipientTable'));
			}
		}

        var gr0 = new GlideRecord('sys_notification_recipient');
        gr0.addQuery('notification', notificationId);
		gr0.addActiveQuery();
        gr0.query();
		

        while (gr0.next()) {
			if (fromAdditionalRecipient == gr0.getUniqueValue())
				continue;
			
			nonSysUserCount += this._getNonSysUserCount(gr0.getValue('recipients'), gr0.getValue('condition'), gr0.getValue('recipient_table'));
        }

        var userCount = sysUserCount + nonSysUserCount;

        if (userCount > userLimit) {
			gs.addInfoMessage(gs.getMessage(
				"The number of users in the notification '{0}' exceeds the maximum limit. Update the notification recipient to less than {1}. {2}",
				[GlideStringUtil.escapeHTML(notificationName), GlideStringUtil.escapeHTML(userLimit.toString()), this._getDocLinkForResource('config-va-notifications')]));
        }
		
		return;
    },
		
	_getNonSysUserCount: function(staticRecipients, condition, recipientTable) {
        var staticRecipientsCount = staticRecipients ? staticRecipients.split(',').length : 0;
		
		if (!condition) //no conditions defined on the condition builder
			return staticRecipientsCount;
			
        var gr1 = new GlideRecord(recipientTable);
        gr1.addEncodedQuery(condition);
        gr1.query();

		return staticRecipientsCount + gr1.getRowCount();
	},

	_getDocLinkForResource: function(resourceName) {
		var documentationLink = new SNC.ContextDocAPI().getURLFromName('config-va-notifications');
		return '<a target="_blank" href="' + documentationLink + '">' + gs.getMessage("Learn more.") + '</a>';
	},

    type: 'VANotificationWarningUtil'
});
