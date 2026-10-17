var CheckClusteringDBScanEnabled = Class.create();
CheckClusteringDBScanEnabled.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    fetchSolutionParameters: function() {
        var result = this.newItem("result");
        result.setAttribute("hideFields", "false");

        var gr = new GlideRecordSecure("ml_advanced_solution_settings");
        var solutionId = this.getParameter('sysparm_solution_id');
        gr.addQuery('ml_capability_definition_base', 'solutionId');
        gr.query();
        while (gr.next()) {
            //proceed to get the solution parameters for given solution id
            var param = gr.getValue('solution_parameters');
            if (param == "f4c4ca8053c04010d1dcddeeff7b1236") {
                result.setAttribute("hideFields", "true");
            }
        }
    },

    type: 'CheckClusteringDBScanEnabled'
});
