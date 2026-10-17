var NotificationPreferencesUtil = Class.create();

NotificationPreferencesUtil.prototype = {

    initialize: function() {},

    /* generates the notification preferences url
    	instanceUrl - domain url of the portal to be redirected to including protocol(http/https)
    	portal - name of the portal
    	page- identifier of the page which contains notification preferences widget
    	userId- user sys_id
    	userTable - recipient table name the user belongs to
    	notificationId - sys_id of the notification
    	destinationTypeId- sys_id of the destination type
    */
    generateUrlForPortal: function(instanceUrl, portal, page, userId, userTable, notificationId, destinationTypeId) {

        if (!gs.nil(instanceUrl) && !gs.nil(page) && !gs.nil(portal) && !gs.nil(userId) && !gs.nil(userTable) &&
            !gs.nil(notificationId) && !gs.nil(destinationTypeId)) {
            var token = SNC.PreferencesTokenUtility.generateNotifPrefToken(userId, userTable, notificationId, destinationTypeId);
            var url = instanceUrl + '/' + portal + '?id=' + page + '&token=' + token;
            return new GlideTinyURL().createTinyURL(url);
        } else {
            gs.addErrorMessage(gs.getMessage("Mandatory parameter is missing."));
        }
    }

};
