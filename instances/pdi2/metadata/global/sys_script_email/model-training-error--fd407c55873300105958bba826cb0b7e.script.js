(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

          // Add your code here
		var solutionStatus = new PIWBMLAPIAdapter().getSolutionStatus(current.ml_model_solution_name);
	
		template.print(gs.getMessage('Use Case Name: {0}' , current.usecase.name + ''));
		template.print('<br/><br/>');

		template.print(gs.getMessage('Model Name: {0}' , current.name + ''));
		template.print('<br/><br/>');

		template.print(gs.getMessage('Training Status: Training Error'));
		template.print('<br/><br/>');

		template.print(gs.getMessage('Click here to view the Use case:') + '<a title="Usecase - Setup Assistant" href="$pi_workbench.do#/setupassistant?usecase_id='+ current.usecase +'"> LINK </a></br></br>');
		template.print('<br/><br/>');
	
		if (solutionStatus.status) {
			
			template.print(gs.getMessage('Failure State: {0}' , solutionStatus.status.state));
			template.print('<br/><br/>');
			
			if (solutionStatus.status.details && solutionStatus.status.details.length > 0) {
				var failed = solutionStatus.status.details.filter(function(item){
					return item.stepState == 'Failed';
				});

				if(failed.length > 0)
					template.print(gs.getMessage('Failure Message: {0}' ,failed[0].message));
			}
		}
	
		template.print('<br/><br/><br/><br/><br/><br/><br/><br/>');
			
		template.print(gs.getMessage('This is an informative message. Please do not reply to this message.'));
		template.print('<br/><br/>');

})(current, template, email, email_action, event);
