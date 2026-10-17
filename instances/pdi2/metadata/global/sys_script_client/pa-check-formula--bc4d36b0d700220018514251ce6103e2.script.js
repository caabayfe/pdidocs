function onLoad() {
	var aj = new GlideAjax('PAAjax');
	aj.addParam('sysparm_name', 'checkFormula');
	aj.addParam('sysparm_id', g_form.getUniqueValue());
	aj.addParam('sysparm_formula', g_form.getValue('formula'));
	aj.getXML(callbackFormula);
}

function callbackFormula(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    if ("false" == answer) {
	    var errorMessage = response.responseXML.documentElement.getAttribute("error");
	    g_form.addErrorMessage(errorMessage);
	}
	   
}
