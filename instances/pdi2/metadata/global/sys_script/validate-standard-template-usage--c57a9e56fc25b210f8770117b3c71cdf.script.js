(function executeRule(current, previous /*null when async*/ ) {

    if (current.disable_standard_template.changesTo(true)) {
        var util = new ArticleTemplateUtilSNC();
        var articleCount = util.hasArticlesUsingStandardTemplate(current.sys_id);
        if (articleCount > 0) {
            var kbTitle = current.getDisplayValue();
            gs.addErrorMessage(gs.getMessage('<b>Standard</b> cannot be disabled as it is being used by articles in {0} knowledge base.', ['<b>' + kbTitle + '</b>']));
            current.disable_standard_template = false;
            current.setAbortAction(true);
        }
    }

})(current, previous);
