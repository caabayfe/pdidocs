(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template, /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action, /* Optional GlideRecord */ event) {

	var usecaseId = current.getValue('usecase');
	var templateNum = current.usecase.template.number; 
	
    var urlDashboard = gs.getMessage('nav_to.do?uri=$pa_dashboard.do%3Fsysparm_dashboard%3D1c074e93875200105958bba826cb0b33%26sysparm_tab%3Df4de221f533200108ea2ddeeff7b123b%26sysparm_element%3D{0}%26sysparm_element_value%3D{0}', [usecaseId]);
	var urlGuidedSetup = gs.getMessage('nav_to.do?uri=%2F$pi_workbench.do%23%2Fsetupassistant%3Fusecase_id%3D{0}%26template_number%3D{1}%23{1}_setupassistant', [usecaseId, templateNum]);
	var urlProperties = 'nav_to.do?uri=%2Fsystem_properties_ui.do%3Fsysparm_title%3DPredictive%20Intelligence%20Workbench%20Settings%26sysparm_category%3DPredictive%20Intelligence%20Workbench';
	
	var modelName = current.getValue('name');
	var usecaseName = current.usecase.name;
	var solutionName = current.getValue('ml_model_solution_name');
	var data = new PIWBUsecaseModelUtil().getIntegratedModelNetAutomationDetails(current);
	var currentNetAuto = data.actualNetAutomation.toFixed(0);
	var goalNetAuto = data.trainingNetAutomation.toFixed(0);

	template.print(gs.getMessage('The currently integrated model "{0}" within the use case "{1}" is currently predicting <b>{2}%</b> of incidents correctly, down from an estimated <b>{3}%</b>.', [modelName, usecaseName, currentNetAuto, goalNetAuto]));
	template.print('<br/><br/>');
	
    template.print(gs.getMessage('Click <a href={0}>here</a> to monitor model performance.', urlDashboard));
	template.print('<br/><br/>');
	
	template.print(gs.getMessage('Click <a href={0}>here</a> to go to the use case page to ensure peak performance of your model. You can create a replacement model or tune and test an existing model to improve the overall performance.', urlGuidedSetup));
	template.print('<br/><br/>');
	
	template.print(gs.getMessage('Alternatively, click <a href={0}>here</a> to change the underperformance threshold property of your use cases to reflect your changing business conditions.', urlProperties));
	template.print('<br/><br/>');
	
})(current, template, email, email_action, event);
