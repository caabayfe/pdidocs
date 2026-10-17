(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
	try {
		var recordInfo = JSON.parse(event.parm1);
		var table = recordInfo.table;
		var recordId = recordInfo.recordId;
		var chatId = recordInfo.chatId;

		var number, shortDescription, urgency;
		var recordGr = new GlideRecord(table);
		if (recordGr.get(recordId)) {
			number = recordGr.getValue('number') ?? "";
			shortDescription = recordGr.getValue('short_description') ?? "";
			urgency = recordGr.getValue('urgency') ?? "";
		}
		var chatTitle;
		var chatGr = new GlideRecord('sys_cs_collab_chat');
		if (chatGr.get(chatId)) {
			chatTitle = chatGr.getValue('title');
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
		if (number) 
			template.print(gs.getMessage('You have been added to a discussion and may have unread message(s) on {0}{1}{2}.', ['<strong>', number, '</strong>']));
		else
			template.print(gs.getMessage('You have been added to a discussion and may have unread message(s).'));
		
		template.print('<br><br><a href="' + instanceUrl + table + '.do%3Fsys_id%3D' + recordId + '%26open-collab-chat%3Dtrue%26collab_chat_id%3D' + chatId + '"');
		template.print('style="' + backgroundColor + color + fontSize + fontFamily + textDecoration + webKitBorder + mozBorder + display + padding);
		template.print('">');
		template.print(gs.getMessage('View discussion'));
		template.print('</a><br><br>');
		template.print(gs.getMessage('{0}About:{1}', ['<strong>', '</strong><br><br>']));
		template.print(gs.getMessage('Title: {0}{1}{2}', ['<strong>', chatTitle, '</strong><br><br>']));
		if (shortDescription)
			template.print(gs.getMessage('Short description: {0}{1}{2}', ['<strong>', shortDescription, '</strong><br><br>']));
		if (urgency)
			template.print(gs.getMessage('Urgency: {0}{1}{2}', ['<strong>', urgency, '</strong><br><br>']));
		template.print('</div>');			
	} catch(ex) {
		gs.error("Exception in constructing email for the report " + ex.stack, ex);
	}
	
})(current, template, email, email_action, event);
