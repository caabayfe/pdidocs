function onLoad() {
    var ga = new GlideAjax('AISIndexSourceUtils');
    ga.addParam('sysparm_name', 'checkGuardRailLimit');
    ga.addParam('sysId', g_form.getUniqueValue()); // Get the current record's sys_id
    ga.addParam("table", g_form.getValue('source'));

    ga.getXMLAnswer(function(response) {
        var result = response;
        if (result == "true") {            		
            g_form.addInfoMessage(getMessage("Warning: This indexed source has record limit in place for optimal performance. Please review and manage your indexed documents to ensure all relevant and important data gets indexed. For more information, visit <a href=\"/api/now/v1/context_doc_url/indexed-source-guardrails-ais\" target=\"_blank\">Help Article</a>."));
			
        }
    });
}
