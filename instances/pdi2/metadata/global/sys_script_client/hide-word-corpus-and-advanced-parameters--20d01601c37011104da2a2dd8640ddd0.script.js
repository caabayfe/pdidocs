function onLoad() {
    //Type appropriate comment here, and begin script below
    var ga = new GlideAjax('FetchWorkflowClassificationEnabler');
    ga.addParam('sysparm_name', 'fetchProperty');
    ga.getXML(ajaxResponse);

    function ajaxResponse(response) {
		var result = response.responseXML.getElementsByTagName("result");
		var message = result[0].getAttribute("hideFields");
        if (message == "true") {
            g_form.setDisplay('word_vector_corpus', false);
			annotation = document.getElementsByClassName("annotation-wrapper");
			annotation[0].style.display = 'none';
            for (var i = 1; i < annotation.length; i++) {
                split_text = annotation[i].innerText.split(':');
				split_text[0] = 'STEP '.concat(i.toString());
				annotation[i].innerText = split_text.join(':');
            }
        }
    }
}
