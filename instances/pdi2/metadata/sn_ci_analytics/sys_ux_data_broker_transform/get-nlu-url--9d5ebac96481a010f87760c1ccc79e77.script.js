function transform(input) {
    var output = {};
    var PREDICTION_URI = '/nav_to.do?uri=%2Fopen_nlu_predict_intent_feedback_list.do';
    var PERFORMANCE_URI = '/nav_to.do?uri=%2F$nlu-workbench.do%3F%23%2Fperformance';

    var isPluginInstalled = GlidePluginManager.isActive("com.snc.nlu.workbench.advanced");
    if (!isPluginInstalled) {
        output.url = PREDICTION_URI;
        return output;
    }
    var gr = new GlideRecord('sys_cs_general_settings');
    gr.addQuery('nlu_enabled', true);
    gr.addQuery('nlu_driver.name', 'ServiceNow NLU');
    gr.query();
    if (gr.hasNext()) {
        output.url = PERFORMANCE_URI;
    } else {
        output.url = PREDICTION_URI;
    }
    return output;
}
