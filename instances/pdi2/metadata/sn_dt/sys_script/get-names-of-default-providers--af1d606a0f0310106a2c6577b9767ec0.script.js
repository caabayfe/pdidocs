(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("sn_dt_translator_configuration");
    var queryCondition = gr.addQuery('default_provider', true);
    queryCondition.addOrCondition('default_detection', true);
    gr.query();
    while (gr.next()) {
        if (gr.getValue("default_provider") == true) {
            g_scratchpad.default_translation = gr.getValue("name");
        }
        if (gr.getValue("default_detection") == true) {
            g_scratchpad.default_detection = gr.getValue("name");
        }
    }
})(current, previous);
