function onLoad() {
   //Type appropriate comment here, and begin script below
   var solutionName = g_form.getValue("solution_name");
    var version = g_form.getValue("version");
    var ga = new GlideAjax('FetchWorkflowClusteringCapability');
    ga.addParam('sysparm_name', 'isWorkflowClusteringCapability');
    ga.addParam('sysparm_solutionName', solutionName);
    ga.addParam('sysparm_version', version);
    ga.getXMLAnswer(ajaxResponse);

    function ajaxResponse(response) {
        if (response) {
            g_form.setDisplay('word_vector_corpus', false);
        }
    }
}
