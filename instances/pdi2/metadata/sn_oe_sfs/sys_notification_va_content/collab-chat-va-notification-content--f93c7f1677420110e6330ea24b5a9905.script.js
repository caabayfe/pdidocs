(function getNotificationHeadingAndMessage(
    /*GlideRecord of record changed to cause notification*/ target,
    /*GlideRecord of event triggered to cause notification*/ event,
    /*Recipient Table Name*/ recipientTable,
    /*Recipient Sys Id*/ recipientSysId) {
	
	if (gs.getProperty("com.glide.cs.collab.teams.notifcard") == "false") {
	  gs.error("Could not send Notification for user: " + recipientSysId + ".  Property com.glide.cs.collab.teams.notifcard is currently set to false.  Please contact a ServiceNow Administrator to turn on.");
	  return;
	}
	var userGR = new GlideRecord('sys_user');
	userGR.get(recipientSysId);
	
	var collabChatID = target.getValue('collab_chat');
	// get originator
	var collabMemberGR = new GlideRecord('sys_cs_collab_member');
	collabMemberGR.addQuery('collab_chat', collabChatID);
	collabMemberGR.addQuery('member_type', 'creator');
    collabMemberGR.query();
	var requestorName = gs.getMessage("Someone");
	if (collabMemberGR.next()) {
		requestorName = requestorName = collabMemberGR.getElement('member.display_name');
	}
	// get collab record (i.e. incident)
	var collabRecordGR = new GlideRecord('sys_cs_collab_record');
	collabRecordGR.addQuery('collab_chat', collabChatID);
	collabRecordGR.query();
	if(collabRecordGR.next()) {
		var tableName = collabRecordGR.getValue('table');
		var documentGR = new GlideRecord(tableName);
		if(documentGR.get(collabRecordGR.getValue('document'))) {
			var number = documentGR.getValue('number');
			var recordID = documentGR.getValue('sys_id');
			var documentID = documentGR.getUniqueValue();
			var member = documentGR.getValue('member');
			var formattedMessageHeading = gs.getMessage('Hi ') + userGR.getValue("first_name") + ', ' + requestorName + gs.getMessage(' requests help in a Collaboration Chat, click on the record link and open a chat');

			var recordLink =  gs.getProperty('glide.servlet.uri') + '/now/nav/ui/classic/params/target/' + tableName + '.do%3Fopen-collab-chat%3Dtrue%26sys_id%3D' + recordID + '%26collab_chat_id%3D' + collabChatID;
	
			var formattedMessageContent = '[' + number + ']' +  '(' + recordLink + ')\n'
			+ '\n\n**' + documentGR.getValue('short_description') + '**  \n\n'
			+ '**' + gs.getMessage("State") + '**:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
				documentGR.getDisplayValue('state') + '  \n'
			+ '**' + gs.getMessage("Assigned To") + '**:&nbsp;&nbsp;' +
				documentGR.getDisplayValue('assigned_to') + '  \n';
			var priority = documentGR.getDisplayValue('priority');
			if (priority) {
				formattedMessageContent +=  ('**' + gs.getMessage("Priority") + '**:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
				documentGR.getDisplayValue('priority'));
            }
		return {messageHeading: formattedMessageHeading, messageContent: formattedMessageContent};
		}
	}else {
		gs.error("Could not send Notification for user: " + recipientSysId +
				 "\nAs Collaboration Chat could not be found: " + collabChatID);
	}
})(target, event, recipientTable, recipientSysId);
