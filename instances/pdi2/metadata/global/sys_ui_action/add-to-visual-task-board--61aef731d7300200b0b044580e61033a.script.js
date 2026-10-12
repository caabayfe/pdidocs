function openAddToBoardDialogListContext() {
	var tableName = g_list.getTableName();
	
	var url = GlideURLBuilder.newGlideUrl("$vtb_add_to_board.do");
	url.addParam("sysparm_nostack", "yes");
	url.addParam("sysparm_record_id", rowSysId);
	url.addParam("sysparm_table_name", tableName);
	
	var o = new GlideModal(g_guid.generate(), false, 'modal-95');
	o.setTitle(g_i18n.getMessage("Select a Visual Task board"));
	o.setAutoFullHeight(true);
	o.setPreference("sysparm_table_name", tableName);
	o.setPreference("sysparm_record_id", rowSysId);
	o.renderIframe(url.getURL());
	
	var setMessagesCallback = (function(modal){
		return function(messages){ return displayMessageStashListContext(messages, modal); };
	})(o);
	
	CustomEvent.observe('vtb.addToBoard.setMessages', setMessagesCallback);
	
	// Clean up the setMessages event handler
	o.on('beforeclose', function(){
		CustomEvent.un('vtb.addToBoard.setMessages', setMessagesCallback);
	});
}

function displayMessageStashListContext(m, modal) {
	if (!m)
		return;

    if (m.messages.info) {
		for(var i = 0; i < m.messages.info.length; i++) {
			var msg = m.messages.info[i];
			if(msg)
				g_notification.show("info", msg);
		}
	}
	
	if (m.messages.error) {
		for(var i = 0; i < m.messages.error.length; i++) {
			var msg = m.messages.error[i];
			if(msg)
				g_notification.show("error", msg);
		}
	}

	modal.destroy();
	return false;
}
