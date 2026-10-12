function onLoad() {
    //Type appropriate comment here, and begin script below
    var ga = new GlideAjax('CheckClusteringDBScanEnabled');
    ga.addParam('sysparm_name', 'fetchSolutionParameters');
    ga.addParam('sysparm_solution_id', g_form.getUniqueValue());
    ga.getXML(ajaxResponse);

    function ajaxResponse(response) {
        var result = response.responseXML.getElementsByTagName("result");
        var message = result[0].getAttribute("hideFields");
        if (message == "true") {
            g_form.setMandatory('min_records', false);
            g_form.setDisplay('min_records', false);
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
