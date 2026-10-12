function generateSecureToken() {
    var ga = new GlideAjax('SecureTokenGenerator');
    ga.addParam('sysparm_name', 'generateSecureToken');
    ga.getXML(addToTokenField);
}

function addToTokenField(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    g_form.setValue('token', answer);
}
