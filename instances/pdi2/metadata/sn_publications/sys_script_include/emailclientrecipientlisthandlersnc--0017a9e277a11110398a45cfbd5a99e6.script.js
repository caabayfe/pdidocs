var EmailClientRecipientListHandlerSNC = Class.create();
EmailClientRecipientListHandlerSNC.prototype = {
    initialize: function() {},

	/*
	 * Checks if event is related to recipient list resolution
	 */
    isRecipientListEvent: function(event) {
        var recipientDetails;

        try {
            recipientDetails = JSON.parse(event.parm1 + '');
        } catch (err) {
            gs.error("EmailClientRecipientListHandlerSNC: Invalid event parm1 passed");
            return false;
        }


        if (!recipientDetails.recipientItemSysID || !recipientDetails.recipientTable || !recipientDetails.emailSysID) {
            gs.error("EmailClientRecipientListHandlerSNC: Required event params are not provided");
            return false;
        } else if (recipientDetails.recipientTable === "sn_publications_recipients_list") {
            var recipientListGr = this.getRecipientListGr(recipientDetails.recipientItemSysID);
            if (recipientListGr)
                return true;
        }

        return false;
    },

    getRecipientListGr: function(sysId) {
        var recipientListGr = new GlideRecord("sn_publications_recipients_list");
        if(recipientListGr.get(sysId));
			return recipientListGr;
    },
	
	getEmailGr: function(sysId) {
		var emailGr = new GlideRecord("sys_email");
        if(emailGr.get(sysId));
			return emailGr;
	},
	
	getEmailIDs: function(userList) {
		var emailIDs = [];
		for (var i = 0; i < userList.length; i++) {
			var gUser = new GlideRecord('sys_user');
			if (gUser.get(userList[i])) {
				var email = gUser.getValue('email');
				if (email)
					emailIDs.push(email);
			}
		}
		return emailIDs;
	},
	
	

    type: 'EmailClientRecipientListHandlerSNC'
};
