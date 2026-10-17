function onClick(g_form) {
	g_form.addInfoMessage(getMessage('Experience is being migrated to ACE V2. Please wait.'));
    var appId = g_form.getUniqueValue();
    var ga = new GlideAjax('sn_ace.ACEAppBuilderAjaxUtils');
    ga.addParam('sysparm_name', 'migrateExperienceToACEV2');
    ga.addParam('app_id', appId);
    ga.getXMLAnswer(function(answer) {
        if (answer) {
            g_form.addInfoMessage(getMessage('Experience has been migrated to ACE V2 successfully.'));
        } else {
            g_form.addErrorMessage(getMessage('Failed to migrate to ACE v2'));
        }
    });
}
