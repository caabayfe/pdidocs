(function process(/*ResolverEnvironment*/ env) {

	// Get the Email Interaction records from the arguments
	var records = env.getArguments().records;
	var results = [];

	for(let i = 0; i < records.length; i++) {

		var count = 0;
		var interactionSysId = records[i];

		var emailTableGr = new GlideRecordSecure('sys_email');
		var messUnreadGr = new GlideRecordSecure('messaging_unread');
		var gdt = new GlideDateTime();
        
		
		messUnreadGr.get('interaction', interactionSysId);
		
		if(messUnreadGr.isValidRecord() && messUnreadGr.getValue('last_msg_read') !== null) {
			var lastMsgRead = messUnreadGr.getValue('last_msg_read').toString();
			gdt.setNumericValue(lastMsgRead);
		}
		
		emailTableGr.addQuery('instance', interactionSysId);
		emailTableGr.addQuery('type', 'received');
		emailTableGr.addQuery('sys_created_on', '>=', gdt);
		emailTableGr.orderByDesc('sys_created_on');
		emailTableGr.query();

		var lastEmail = "";
		
		if (emailTableGr.next()) {
			lastEmail = emailTableGr.getValue('body_text');
			if (emailTableGr.getValue('sys_created_on') > gdt) {
				count = emailTableGr.getRowCount() - 1;
			}
		}	
		
		results.push({
			count: count,
			interactionId: interactionSysId,
			lastMsgRead: messUnreadGr.getValue('last_msg_read'),
			lastMsgSent: messUnreadGr.getValue('last_msg_sent'),
			lastEmailReceived: lastEmail
		});
	}

	return results;
})(env);
