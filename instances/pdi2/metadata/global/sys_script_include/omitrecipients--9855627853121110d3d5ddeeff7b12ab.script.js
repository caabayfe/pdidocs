var omitRecipients = Class.create();
omitRecipients.prototype = {
    initialize: function() {
    },
	
	shouldOmit: function(sysId) {
        var shouldOmit = false;

        //Only when Polaris is Enabled
        if (sn_ui.PolarisUI.isEnabled()) {
            var gr = new GlideRecord("sysevent_email_action");
            gr.get(sysId);

            //Connect/Live Feed Notifications except ConnectNotificationPushNotification and Activity Stream @Mention Email
            if ((gr.getDisplayValue("category") === "Connect" || gr.getDisplayValue("category") === "Live Feed") &&
                !(gr.getDisplayValue('name') === "ConnectNotificationPushNotification" || gr.getDisplayValue('name') === "Activity Stream @Mention Email"))
                shouldOmit = true;
        }
        return shouldOmit;
    },
	
    type: 'omitRecipients'
};
