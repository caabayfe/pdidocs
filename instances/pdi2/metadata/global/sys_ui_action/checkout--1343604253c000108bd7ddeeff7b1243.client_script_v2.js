function onClick(g_form) {
    var ga = new GlideAjax('KBAjax');
    ga.addParam('sysparm_type', 'checkoutArticle');
    ga.addParam('sysparm_kb_id', g_form.getUniqueValue());
    ga.addParam('sysparm_kb_table', g_form.getTableName());
    ga.getXMLAnswer(articleCheckoutResponse);

    function articleCheckoutResponse(response){
        if(response){
            var answer = JSON.parse(response);
            if(answer && answer.sysId){
                var message = getMessage('A new version of the article is created for revision.');
                if(answer.message){
                    message += "::" + answer.message;
                }
                g_aw.openRecord(g_form.getTableName(), answer.sysId, { mode: 'form', alerts: message});
            }
        }else{
            g_form.addInfoMessage(getMessage('You cannot checkout this article as it is already checked out.'));
        }
    }
}
