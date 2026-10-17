function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue === 'true') {
        var ga = new GlideAjax('AISAdminMessageUtils');
        ga.addParam('sysparm_name', 'getMessageForIndexedSourcesWithoutAttachmentIndexing');
        ga.addParam('sysparm_profile_id', g_form.getValue("search_profile"));
        ga.getXML(renderInfoMsg);
        g_form.addInfoMessage(getMessage("To enable display of attachments as part of their parent record's search result in a search application, set the index_attachments indexed source attribute to true for all indexed sources with search sources included in the application's search profile."));
    } else if (newValue === 'false') {
        g_form.hideFieldMsg();
    }

    function renderInfoMsg(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer && answer.length > 0) {
            g_form.addInfoMessage(answer);
        }
    }
}
