(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
		  
          // Add your code here
		var attachTaskLink = '<a href="' + current.getTableName() + '.do?sys_id=' + current.getUniqueValue() + '">' + current.number + '</a>';
		template.print(attachTaskLink);
})(current, template, email, email_action, event);
