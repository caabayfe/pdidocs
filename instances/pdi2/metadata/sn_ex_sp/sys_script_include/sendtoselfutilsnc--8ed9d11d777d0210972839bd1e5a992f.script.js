var SendToSelfUtilSNC = Class.create();
SendToSelfUtilSNC.prototype = {
    initialize: function() {},

    getSendToSelfConfigRecord: function(portalId) {
        var configGr = new GlideRecord("sn_ex_sp_send_self_configuration");
        configGr.addActiveQuery();
        configGr.addQuery("portal", portalId);
        configGr.query();
        if (configGr.next()) {
            return configGr;
        }
    },

    getRequestProfileUpdateElement: function(portalSuffix) {
        var requestProfileCatItemURL = '/'.concat(portalSuffix, '?id=sc_cat_item&sys_id=060189a3c3422200b599b4ad81d3ae66');
        var requestProfileText = gs.getMessage('Request profile update');
        var requestProfileUpdateElement = '<a title="'.concat(requestProfileText, '" target="_self" href="', requestProfileCatItemURL, '">', requestProfileText);
        return requestProfileUpdateElement;
    },


    getUserContactDetails: function() {
        var userDetails = {};
        var userId = gs.getUserID();
        var userGr = new GlideRecord("sys_user");
        if (userGr.get(userId)) {
            userDetails.userId = userId;
            if (userGr.email)
                userDetails.email = userGr.email.toString();
            if (userGr.home_phone)
                userDetails.phone = userGr.home_phone.toString()
        }
        return userDetails;
    },

    getKbGr: function(query, value) {
        var kbGr = new GlideRecord("kb_knowledge");
        kbGr.addQuery(query, value);
        kbGr.addQuery("workflow_state", "published");
        kbGr.query();
        if (kbGr.next() && kbGr.canRead()) {
            return kbGr;
        }
    },

    checkActivePlugin: function(pluginId) {
        return GlidePluginManager.isActive(pluginId);
    },

    insertOrUpdateUsageCount: function(portalId, contentType, notificationType, user) {
        var gr = new GlideRecord('sn_ex_sp_send_to_self_notification_usage');
        gr.addQuery('user', user);
        gr.addQuery('portal', portalId);
        gr.addQuery('date', new GlideDateTime().getDate());
        gr.query();
        if (gr.next()) {
            if (contentType == 'knowledge') {
                notificationType == 'email' ? gr.kb_email_count = gr.kb_email_count + 1 : gr.kb_sms_count = gr.kb_sms_count + 1;
            } else if (contentType == 'schedule') {
                notificationType == 'email' ? gr.schedule_email_count = gr.schedule_email_count + 1 : gr.schedule_sms_count = gr.schedule_sms_count + 1;
            }
            gr.update();
        } else {
            gr.initialize();
            gr.portal = portalId;
            gr.user = user;
            gr.date = new GlideDateTime().getDate();
            if (contentType == 'knowledge') {
                notificationType == 'email' ? gr.kb_email_count = 1 : gr.kb_sms_count = 1;
            } else if (contentType == 'schedule') {
                notificationType == 'email' ? gr.schedule_email_count = 1 : gr.schedule_sms_count = 1;
            }
            gr.insert();
        }
    },

    type: 'SendToSelfUtilSNC'
};
