var FetchWorkflowClassificationCapability = Class.create();
FetchWorkflowClassificationCapability.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    isWorkflowClassificationCapability: function() {
        var solutionName = this.getParameter("sysparm_solutionName");
        var version = this.getParameter("sysparm_version");
        var gr = new GlideRecord("ml_solution");
        gr.addQuery("solution_name", solutionName);
        gr.addQuery("version", version);
        gr.query();

        if (gr.next()) {
            if (gr.getValue("capability") == "workflow_classification_trainer") {
                var result = {
                    "hideFields": "true"
                };
                return JSON.stringify(result);
            }
        }
        return null;
    },

    type: 'FetchWorkflowClassificationCapability'
});
