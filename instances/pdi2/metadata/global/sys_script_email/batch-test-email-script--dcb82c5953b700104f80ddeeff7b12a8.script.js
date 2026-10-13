(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var gr = new GlideRecord(PIWBConstants.TABLES.PREDICTION_RUN);
	if(gr.get(event.parm1)) {
		if(gr.getValue('status') == 'completed') {
			var input_config = new JSON().decode(gr.getValue('input_config'));
			var models = input_config.models.join();
			var test_type = gr.getValue('prediction_type');
			if(gs.nil(gr.getValue('model'))) {
				var url = '$pi_workbench.do#/testmodels?usecase_id='+ gr.getValue('usecase') +'&test_type='+ test_type + '&models='+ models + '';
				template.print(gs.getMessage('The batch test process finished successfully for the usecase  <b> {0} </b></br></br>', current.getValue('name')));
				template.print(gs.getMessage('You can see the test results by visiting <a title="PIWB Testing" href="'+ url +'"> PIWB Testing </a></br></br>'));
				template.print(gs.getMessage('You can also download the test results by clicking on <a title="Download results" href="'+ PIWBConstants.TABLES.PREDICTION_RESULT +'.do?CSV&sysparm_query=prediction_run=' + gr.getUniqueValue() + ' &sysparm_orderby=model"> Download results </a>'));
			}
			else {
				url = '$pi_workbench.do#/integratemodel?usecase_id='+ gr.getValue('usecase') +'&mode=info&model_id='+ gr.getValue('model') + '';
				template.print(gs.getMessage('The batch test process finished successfully for the usecase  <b> {0} </b> and Model <b>{1}</b></br></br>', [current.getValue('name'), gr.model.name]));
				template.print(gs.getMessage('You can see the test results by visiting <a title="PIWB Model Info" href="'+ url +'">PIWB Model Info </a></br></br>'));
				template.print(gs.getMessage('You can also download the test results by clicking on <a title="Download results" href="'+ PIWBConstants.TABLES.PREDICTION_RESULT +'.do?CSV&sysparm_query=prediction_run=' + gr.getUniqueValue() + ' &sysparm_orderby=version"> Download results </a>'));
			}
		}
		else {
			if(gs.nil(gr.getValue('model'))) {
				template.print(gs.getMessage('The batch test process finished with errors for the usecase <b> {0} </b></br></br>', current.getValue('name')));
			}
			else {
				template.print(gs.getMessage('The batch test process finished with errors for the usecase <b> {0} </b> and Model <b> {1} </b></br></br>', [current.getValue('name'), gr.model.name]));
			}
		}
	}

})(current, template, email, email_action, event);
