var EmailNotificationRedirection = Class.create();
EmailNotificationRedirection.prototype = Object.extendsObject(EmailNotificationRedirectionSNC, {
    initialize: function() {
		EmailNotificationRedirectionSNC.prototype.initialize.call(this);
    },

    type: 'EmailNotificationRedirection'
});
