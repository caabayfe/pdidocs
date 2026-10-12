var FetchWorkflowRegressionEnabler = Class.create();
FetchWorkflowRegressionEnabler.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	fetchProperty: function() {
		var result = this.newItem("result");
		if (gs.getProperty("glide.platform_ml.api.enable_workflow_regression") == 'true') {
			result.setAttribute("hideFields", "true");
		}
		else{
			result.setAttribute("hideFields", "false");
		}
	},

    type: 'FetchWorkflowRegressionEnabler'
});
