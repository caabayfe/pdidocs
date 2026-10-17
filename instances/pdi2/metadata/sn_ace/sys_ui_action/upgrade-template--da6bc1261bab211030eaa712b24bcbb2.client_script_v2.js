function onClick(g_form) {
    var pageId = g_form.getUniqueValue();
    var ga = new GlideAjax('sn_ace.ACEAppBuilderAjaxUtils');
    ga.addParam('sysparm_name', 'blankTemplatev2Tov3Migration');
    ga.addParam('sysparm_pageId', pageId);
    ga.getXMLAnswer(function(answer) {
        if (answer) {
            g_form.addInfoMessage(getMessage("BlankTemplate has been changed to V3 successfully.Please refer <a href= sn_ace_Ace_Template_Upgrade.do>document</a> for further steps"));
        } else {
            g_form.addErrorMessage(getMessage('Unable to change BlankTemplate from V2 to V3.'));
        }
    });
}
