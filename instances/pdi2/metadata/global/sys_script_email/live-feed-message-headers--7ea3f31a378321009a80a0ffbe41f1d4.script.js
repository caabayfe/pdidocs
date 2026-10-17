setMailHeaders();

function setMailHeaders() {
	var liveFeedApi = new SNC.LiveFeedApi();
	var tableName = current.getTableName();
	var from;
	var message;
	if(tableName == 'live_message') {
		from = current.profile.name;
		if(current.reply_to)
			message = liveFeedApi.formatMessage(current.reply_to.message, 'TEXT');
		else
			message = liveFeedApi.formatMessage(current.message, 'TEXT');
	}
	if(tableName == 'live_message_like') {
		from = current.profile.name;
		if(current.message.reply_to)
			message = liveFeedApi.formatMessage(current.message.reply_to.message, 'TEXT');
		else
			message = liveFeedApi.formatMessage(current.message.message, 'TEXT');
	}
	if(tableName == 'live_mention') {
		from = current.message.profile.name;
		if(current.message.reply_to)
			message = liveFeedApi.formatMessage(current.message.reply_to.message, 'TEXT');
		else
			message = liveFeedApi.formatMessage(current.message.message, 'TEXT');
	}
	var hasAt = from.indexOf("@") >= 0;
    if (from && !hasAt || (hasAt && (SNC.EmailAddressValidator.validate(from).length === 0))) {
        email.setFrom(from);
    }
	if(message) {
		var subject;
		if(message.length <= 60)
			subject = message;
		else {
			for(var i=60;i>=0;i--) {
				var c = message.charAt(i);
				if(c == ' ' || c == '\t' || c == '\n' || c == '\r') {
					subject = message.substring(0,i);
					break;
				}
			}
			if(!subject)
				subject = message.substring(0,60);
			subject = subject + " ...";
		}
		subject = gs.getMessage("Live Message")+": "+subject;
		email.setSubject(subject);
	}
}
