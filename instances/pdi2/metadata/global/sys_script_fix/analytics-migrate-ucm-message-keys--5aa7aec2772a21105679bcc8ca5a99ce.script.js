gs.log("Start: Analytics Migrate UCM Message Keys")
var messageKeys = [
{ oldKey: "glide.analytics.consent.eu.text", newKey:  "glide.analytics.consent.text.explicit_opt_in"},
{ oldKey: "glide.analytics.consent.other.text", newKey: "glide.analytics.consent.text.notice"}
];

for (var i in messageKeys){
	var oldKey = messageKeys[i].oldKey;
	var newKey = messageKeys[i].newKey;

	var messageGR = new GlideRecord("sys_ui_message");
	messageGR.addQuery("key", "IN", oldKey+','+newKey);
        messageGR.addQuery("language", 'en');
	messageGR.query();

	var obj = {oldMessage: "", newMessage: ""};

	while (messageGR.next()) {
		if(messageGR.getValue("key") === oldKey)
			obj.oldMessage = messageGR.getValue("message");
                if(messageGR.getValue("key") === newKey)
			obj.newMessage = messageGR.getValue("message");
	}
        gs.log(obj.oldMessage);
        gs.log(obj.newMessage);
        if(obj.newMessage != "" && (obj.oldMessage !== obj.newMessage)) {
		var updateMessageGR = new GlideRecord("sys_ui_message");
		updateMessageGR.initialize();
		updateMessageGR.addQuery("key", newKey);
		updateMessageGR.query();
		updateMessageGR.next();
		updateMessageGR.setValue("message", obj.oldMessage);
		updateMessageGR.update();
		gs.log(newKey + " updated with old message: " + obj.oldMessage);
	} else {
        	gs.log("Either old and new messages were exactly the same or the new key did no exist, therefore no action needed.")
        }
}

gs.log("End: Analytics Migrate UCM Message Keys")
