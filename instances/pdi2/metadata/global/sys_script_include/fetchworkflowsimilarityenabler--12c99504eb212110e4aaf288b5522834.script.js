var FetchWorkflowSimilarityEnabler = Class.create();
FetchWorkflowSimilarityEnabler.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    fetchProperty: function() {
		var result = this.newItem("result");
		if (gs.getProperty("glide.platform_ml.api.enable_workflow_similarity") == 'true') {
			result.setAttribute("hideFields", "true");
		}
		else{
			result.setAttribute("hideFiels", "false");
		}
	},

    type: 'FetchWorkflowSimilarityEnabler'
});
