function onLoad() {
    /**
     * No action is taken if AI Search is enabled. But if it's not...
     * 1.) If new record, set search engine to Zing and remove the option for AI Search
     * 2.) If existing record previously set to Zing, remove the option for AI Search
     * 3.) If existing record previously set to AI Search, leave it as is, but show an error at the top of the page
     */
    function updateRecord(isAisEnabled) {
        if (isAisEnabled === "false") {
            if (g_form.isNewRecord()) {
                g_form.setValue('search_engine', 'zing');
            }
            if (g_form.getValue('search_engine') === 'zing') {
                g_form.removeOption('search_engine', 'ai_search');
            } else {
                // For existing records previously set to AI Search
                g_form.addErrorMessage(getMessage('AI Search is set as the search engine, but AI Search is not enabled. You will not get any search results.'));
            }
        }
    }

    // Set defaults for new AI Search records
    if (g_form.isNewRecord() && g_form.getValue('search_engine') === 'ai_search') {
        g_form.setValue('genius_results_limit', 1);
        g_form.setValue('hit_highlighting', true);
        g_form.setValue('spell_check', true);
    }

    // Validate AI Search as a Search Engine Option
    var ga = new GlideAjax('SearchAppConfigAIS');
    ga.addParam('sysparm_name', 'getReadiness');
    ga.getXMLAnswer(updateRecord);
}
