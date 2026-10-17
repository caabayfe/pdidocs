function onClick(g_form) {
    var pageId = g_form.getUniqueValue();

    var ga = new GlideAjax('sn_ace.ACEAppBuilderAjaxUtils');
    ga.addParam('sysparm_name', 'updatePageBundle');
    ga.addParam('sysparm_pageId', pageId);
    ga.getXMLAnswer(function(answer) {
        if (answer) {
            g_form.addInfoMessage(getMessage('Page bundle was successfully published.'));
        } else {
            g_form.addErrorMessage(getMessage('Failed to publish page bundle.'));
        }
    });
}
