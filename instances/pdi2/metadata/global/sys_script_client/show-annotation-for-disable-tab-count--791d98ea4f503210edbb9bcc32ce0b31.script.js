function onLoad() {
    var enableHybridSearch = g_form.getValue('enable_hybrid_search');
   
    if (enableHybridSearch == 'true')
        g_form.showFieldMsg('show_tab_counts', getMessage('count for facet is not available because hybrid search is currently enabled.'));

   
}
