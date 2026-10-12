(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
	try {
		var recordInfos = JSON.parse(event.parm1);
		var recordData = {};
		var chatIds = [];

		for (let i = 0; i < recordInfos.length; i++) {
			var recordInfo = recordInfos[i];
			var table = recordInfo.table;
			var recordId = recordInfo.recordId;

			var recordGr = new GlideRecord(table);
			if (recordGr.get(recordId)) {
				recordData[recordId] = {
					'number': recordGr.getValue('number') ?? "",
					'short_description': recordGr.getValue('short_description') ?? "",
					'urgency': recordGr.getValue('urgency') ?? ""
				};
				chatIds.push(recordInfo.chatId);
			}
		}
		
		var chatTitles = {};
		var chatGr = new GlideRecord('sys_cs_collab_chat');
		chatGr.addQuery("sys_id", "IN", chatIds);
		chatGr.query();
		while (chatGr.next()) {
			chatTitles[chatGr.getUniqueValue()] = chatGr.getValue('title') ?? "";
		}
		
		var fontSize = 'font-size: 16px;';
		var fontFamily = 'font-family: Lato, Arial, sans-serif;';
		var lineBreakBorder = 'border: 0.5px solid #cdcdcd;';
		var backgroundColor = 'background-color: #4F52BD;';
		var color = 'color: #ffffff;';
		var textDecoration = 'text-decoration: none; border-radius: 4px;';
		var webKitBorder = '-webkit-border-radius: 4px;';
		var mozBorder = '-moz-border-radius: 4px;';
		var display = 'display: inline-block;';
		var padding = 'padding: 6px 16px;';
		var instanceUrl = gs.getProperty('glide.servlet.uri');
		if (instanceUrl.substr(-1) != '/') instanceUrl += '/';

		// The sidebar only works with the Polaris nav bar
		instanceUrl += 'now/nav/ui/classic/params/target/';
		
		template.print('<div style="' + fontSize + fontFamily + '">');
		for (let j = 0; j < chatIds.length; j++) {
			let tableName = recordInfos[j].table;
			let recordSysId = recordInfos[j].recordId;
			let data = recordData[recordSysId];

			if (data.number)
				template.print(gs.getMessage('You have unread message(s) on {0}{1}{2}.', ['<strong>', data.number, '</strong>']));
			else
				template.print(gs.getMessage('You have unread message(s).'));
			template.print('<br><br><a href="' + instanceUrl + tableName + '.do%3Fsys_id%3D' + recordSysId + '%26open-collab-chat%3Dtrue%26collab_chat_id%3D' + chatIds[j] + '"');
			template.print('style="' + backgroundColor + color + fontSize + fontFamily + textDecoration + webKitBorder + mozBorder + display + padding);
			template.print('">');
			template.print(gs.getMessage('View discussion'));
			template.print('</a><br><br>');
			template.print(gs.getMessage('{0}About:{1}', ['<strong>', '</strong><br><br>']));
			template.print(gs.getMessage('Title: {0}{1}{2}', ['<strong>', chatTitles[chatIds[j]], '</strong><br><br>']));
			if (data.short_description)
				template.print(gs.getMessage('Short description: {0}{1}{2}', ['<strong>', data.short_description, '</strong><br><br>']));
			if (data.urgency)
				template.print(gs.getMessage('Urgency: {0}{1}{2}', ['<strong>', data.urgency, '</strong><br><br>']));
			
			if (j < chatIds.length) {
				template.print('<hr style="' + lineBreakBorder + '"><br>');
			}
		}
		template.print('</div>');			
	} catch(ex) {
		gs.error("Exception in constructing email for the report " + ex.stack, ex);
	}
	
})(current, template, email, email_action, event);
