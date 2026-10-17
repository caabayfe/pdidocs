function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var gr = new GlideRecord("sp_portal");
    gr.addQuery('sys_id', '81b75d3147032100ba13a5554ee4902b');
    gr.query();

    if (isLoading && oldValue !== newValue) {
        g_form.clearMessages();
        if (g_form.getUniqueValue() === '00731b9d5b231010d9a5ce1a8581c7dd' && gr.next()) {
            var aiSearchEnabled = gr.getValue("enable_ais");

            if (aiSearchEnabled === 'true' && g_form.getValue('search_engine') === 'zing') {
                g_form.addErrorMessage("The search engine is set to Zing, but AI Search is enabled in one or more linked search applications. When choosing Zing as the search engine, you should first clear the Enable AI Search option in all search applications that link to this search application configuration.");
            } else if (aiSearchEnabled === 'false' && g_form.getValue('search_engine') === 'ai_search') {
                g_form.addErrorMessage("The search engine is set to AI Search, but AI Search is disabled in one or more linked search applications. When choosing AI Search as the search engine, you should first select the Enable AI Search option in all search applications that link to this search application configuration.");
            }
        }
    }
}
