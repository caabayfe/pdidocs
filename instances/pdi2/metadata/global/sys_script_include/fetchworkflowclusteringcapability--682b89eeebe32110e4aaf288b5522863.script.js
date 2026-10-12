var FetchWorkflowClusteringCapability = Class.create();
FetchWorkflowClusteringCapability.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    isWorkflowClusteringCapability: function() {
        var solutionName = this.getParameter("sysparm_solutionName");
        var version = this.getParameter("sysparm_version");
        var gr = new GlideRecord("ml_solution");
        gr.addQuery("solution_name", solutionName);
        gr.addQuery("version", version);
        gr.query();

        if (gr.next()) {
            if (gr.getValue("capability") == "workflow_clustering_trainer") {
                var result = {
                    "hideFields": "true"
                };
                return JSON.stringify(result);
            }
        }
        return null;
    },

    type: 'FetchWorkflowClusteringCapability'
});
