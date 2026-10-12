function onLoad() {
   //Type appropriate comment here, and begin script below
   var ga = new GlideAjax('FetchWorkflowSimilarityEnabler');
    ga.addParam('sysparm_name', 'fetchProperty');
    ga.getXML(ajaxResponse);

    function ajaxResponse(response) {
		var result = response.responseXML.getElementsByTagName("result");
		var message = result[0].getAttribute("hideFields");
        if (message == "true") {
			g_form.setMandatory('word_vector_corpus', false);
            g_form.setDisplay('word_vector_corpus', false);
			annotation = document.getElementsByClassName("annotation-wrapper");
			annotation[0].style.display = 'none';
            for (var i = 1; i < annotation.length; i++) {
				text = annotation[i].innerText;
				// Find the index of any number in the text variable
				var regex = /\d/;
				var match = regex.exec(text);
				if (match) {
					var index = match.index;
					var newText = text.substring(0, index) + i.toString() + text.substring(index + 1);
					annotation[i].innerText = newText;
				}
            }
        }
    }
}
