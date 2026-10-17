var ITSMEmailNotificationRedirection = Class.create();
ITSMEmailNotificationRedirection.prototype = {
    initialize: function() {},

    getRedirectionURL: function(type, params) {
        /* intentionally left blank */
    },

    handles: function(type) {
        /* intentionally left blank */
		//Based on the type of the email notification i.e., record or mim or on-call, different redirection URL's will be passed
    },

    type: 'ITSMEmailNotificationRedirection'
};
