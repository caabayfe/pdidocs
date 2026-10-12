(function executeRule(current, previous /*null when async*/) {

    var conversationId = current.sys_id;

    // 1. delete payload for all related messages
	var messageGR = new GlideRecord('sys_cs_message');
	messageGR.addQuery('conversation', conversationId);
	messageGR.query();
	while (messageGR.next()) {
		messageGR.payload = '';
		messageGR.update();
	}
    // 2. delete the task context
	var taskGR = new GlideRecord('sys_cs_conversation_task');
	taskGR.addQuery('conversation', conversationId);
	taskGR.query();
	while (taskGR.next()) {
		taskGR.context = '';
		taskGR.update();
	}

    // 3. delete the conversation context
    var conversationGR = new GlideRecord('sys_cs_conversation');
	if (conversationGR.get(conversationId)) {
		conversationGR.context = '';
		conversationGR.update();
	}

    // 4. delete all related attachments
	var taskIds = [];
	var taskGr = new GlideRecord('sys_cs_conversation_task');
	taskGr.addQuery('conversation', conversationId);
	taskGr.query();

	while (taskGr.next()) {
		taskIds.push(taskGr.getUniqueValue());
	}

	if (taskIds.length > 0) {
		var attGr = new GlideRecord('sys_attachment');
		attGr.addQuery('table_name', 'sys_cs_conversation_task');
		attGr.addQuery('table_sys_id', 'IN', taskIds.join(','));
		attGr.query();

		while (attGr.next()) {
			attGr.deleteRecord();
		}
	}

    //5. delete all attachments related to catalogs submitted during the conversation
	var interactionGR = new GlideRecord('interaction');
	interactionGR.addQuery('channel_metadata_table', 'sys_cs_conversation');
	interactionGR.addQuery('channel_metadata_document', conversationId); 
	interactionGR.query();

	if (interactionGR.next()) {
		var interactionId = interactionGR.sys_id;

		// get all related sc_req_item records from interaction_related_record
		var irrGR = new GlideRecord('interaction_related_record');
		irrGR.addQuery('interaction', interactionId);
		irrGR.addQuery('document_table', 'sc_req_item');
		irrGR.query();

		while (irrGR.next()) {
			var itemId = irrGR.document_id;

			// delete all attachments related to each item
			var attachGR = new GlideRecord('sys_attachment');
			attachGR.addQuery('table_sys_id', itemId);
			attachGR.query();
			while (attachGR.next()) {
				attachGR.deleteRecord();
			}
		}
}
})(current, previous);
