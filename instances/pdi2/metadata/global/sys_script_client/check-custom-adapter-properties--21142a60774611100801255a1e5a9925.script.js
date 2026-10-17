function onSubmit() {

    if (g_form.getUniqueValue() != '3f51f7a3771700105d7b3882a910616d')
        return;

    if (!g_form.getValue('link_account_enabled') || g_form.getValue('account_link_type') == 'basic')
        return;

    var ga = new GlideAjax('AJAXCustomAdapterPropUtil');

    ga.addParam('sysparm_name', 'checkCustomAdapterProperties');
    ga.addParam('provider_scope', '96db2328771700105d7b3882a91061ab');
    ga.addParam("account_link_type", g_form.getValue('account_link_type'));
    ga.getXMLWait();
    var answers = JSON.parse(ga.getAnswer());
	
    if (answers.length > 0) {
      g_form.clearMessages();
      for (var i = 0; i < answers.length; i++)
          g_form.addErrorMessage(answers[i]);
      return false;
  }

    return true;
}
