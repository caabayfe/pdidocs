function process(record) {
	var transformableTables = ['sys_cs_collab_chat', 'sys_cs_collab_message', 'sys_cs_collab_attachment'];
	var table = record.getTable();
	var collabChat;
	
    if (transformableTables.indexOf(table) === -1)
		return;
	
	if (table == 'sys_cs_collab_chat') {
		collabChat = sn_collab.CollabChatScriptObject.getCollabChatSearchResultView(
			record.getSysId()
		);
	
		for (var key in collabChat) {
			record.addField(key, key, collabChat[key], collabChat[key]);
		}
		
		return;
	}
	
	if (table == 'sys_cs_collab_message') {
		var collabChatField = record.getField('collab_chat');
		var messageId = record.getSysId();
		if (!collabChatField) {
			var gr = new GlideRecord('sys_cs_collab_message');
			// if the record does not exist, some internal errors happen. Just return.
			if (!gr.get(messageId))
				return;

			collabChat = getCollabChatSearchResult(messageId, gr.getValue('collab_chat'));
			record.addField('collab_chat', 'collab_chat', gr.getDisplayValue('collab_chat'), gr.getDisplayValue('collab_chat'));
		} else {
			collabChat = getCollabChatSearchResult(messageId, collabChatField.getValue());
		}
	
		for (var key in collabChat) {
			record.addField(key, key, collabChat[key], collabChat[key]);
		}
		
		return;
	}
	
	if (table == 'sys_cs_collab_attachment') {

		var document = record.getField('document');
		var documentValue = '';
		if (!document) {
			var collabAttachmentId = record.getSysId();
			var gr = new GlideRecord('sys_cs_collab_attachment');
			gr.get(collabAttachmentId);
			documentValue = gr.getValue('document');
			record.addField('attachment_sys_id', 'attachment_sys_id', gr.getValue('attachment_sys_id'), gr.getValue('attachment_sys_id'));
		} else {
			documentValue = document.getValue();
		}

		collabChat = sn_collab.CollabChatScriptObject.getCollabChatSearchResultView(
			documentValue
		);
	
		for (var key in collabChat) {
			record.addField(key, key, collabChat[key], collabChat[key]);
		}
		
		return;
	}
	
	return;
}

function getCollabChatSearchResult(messageId, collabChatId) {
	if (sn_collab.CollabChatScriptObject.getCollabChatSearchResultViewBySearchRecord) {
		return sn_collab.CollabChatScriptObject.getCollabChatSearchResultViewBySearchRecord(messageId, 'MESSAGE');
	}
	//fallback to Tokyo version which retrieves the last message from chat
	return sn_collab.CollabChatScriptObject.getCollabChatSearchResultView(collabChatId);
}
