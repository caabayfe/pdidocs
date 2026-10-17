function onClick(g_form) {
    var ga = new GlideAjax('KBAjax');
    ga.addParam('sysparm_type', 'makeThisCurrent');
    ga.addParam('sysparm_kb_id', g_form.getUniqueValue());
    ga.addParam('sysparm_kb_table', g_form.getTableName());
    ga.getXMLAnswer(makeThisCurrentResponse);

    function makeThisCurrentResponse(response){
        if(response && response != ''){
                var message = getMessage('A new version of the article is created for revision.');
                g_aw.openRecord(g_form.getTableName(), response, { mode: 'form', alerts: message});
        }else{
            g_form.addInfoMessage(getMessage("You cannot make this article as the current article as this has already been checked out for revision. Please modify the checked out article or contact your system administrator for further assistance."));
        }
	}
}
