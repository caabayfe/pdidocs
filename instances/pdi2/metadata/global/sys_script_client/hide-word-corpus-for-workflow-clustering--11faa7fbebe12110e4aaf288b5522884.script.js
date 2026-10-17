function onLoad() {
   //Type appropriate comment here, and begin script below
   var ga = new GlideAjax('FetchWorkflowClusteringEnabler');
    ga.addParam('sysparm_name', 'fetchProperty');
    ga.getXML(ajaxResponse);

    function ajaxResponse(response) {
		var result = response.responseXML.getElementsByTagName("result");
		var message = result[0].getAttribute("hideFields");
        if (message == "true") {
            g_form.setMandatory('word_vector_corpus', false);
            g_form.setDisplay('word_vector_corpus', false);
			annotation = document.getElementsByClassName("annotation-wrapper");
            for (var i = 0; i < annotation.length; i++) {
				annotation[i].style.display = 'none';
            }
        }
    }
}
