(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	
		template.print(gs.getMessage('Use Case Name: {0}' , current.usecase.name + ''));
		template.print('<br/><br/>');

		template.print(gs.getMessage('Model Name: {0}' , current.name + ''));
		template.print('<br/><br/>');

		template.print(gs.getMessage('Training Status: Training Complete'));
		template.print('<br/><br/>');

		template.print(gs.getMessage('Click here to view the Use case:') + '<a title="Usecase - Setup Assistant" href="$pi_workbench.do#/setupassistant?usecase_id='+ current.usecase +'"> LINK </a></br></br>');
		template.print('<br/><br/>');

		template.print('<br/><br/><br/><br/>');

		template.print(gs.getMessage('This is an informative message. Please do not reply to this message.'));
		template.print('<br/><br/>');
		
	

})(current, template, email, email_action, event);
