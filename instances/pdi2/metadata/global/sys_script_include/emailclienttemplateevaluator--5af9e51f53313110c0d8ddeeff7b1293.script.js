var EmailClientTemplateEvaluator = Class.create();
EmailClientTemplateEvaluator.prototype = {
    initialize: function() {
    },
	getRecipientsForReplyEmails: function(sourceEmail) {
		var user = sourceEmail.getValue("user");
		var gr = new GlideRecord("sys_user");
		return user && gr.get(user) ? gr.getValue("email") : sourceEmail.getValue("user");
	},
	getRecipientsForReplyAllEmails: function(sourceEmail) {
		var fromRecipient = this.getRecipientsForReplyEmails(sourceEmail);
		var directRecipients = sourceEmail.getValue("direct");

		var result = [];
		if (fromRecipient)
			result.push(fromRecipient);
		if (directRecipients)	
			result.push(directRecipients);
		return result.join(",");
	},
    type: 'EmailClientTemplateEvaluator'
};
