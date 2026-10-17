function onLoad() {
    var viewName = g_form.getViewName();
    var tableName = g_form.getValue("table");
    if (viewName == "index_name" && tableName) {
        var ga = new GlideAjax("TSConfigurationAjax");
        ga.addParam("sysparm_index_table_name", tableName);
        ga.addParam("sysparm_name", "isConfigurationPresentForTextIndexName");
        ga.getXML(processResponse);
    }
}

function processResponse(serverResponse) {
    var result = serverResponse.responseXML.getElementsByTagName("result");
    var isConfigurationPresent = result[0].getAttribute("isConfigurationPresent");
    if (isConfigurationPresent == "true") {
        g_form.hideRelatedList("ts_index_stop.index_list");
        g_form.hideRelatedList("ts_index_synonym_dictionary.index_list");

        var listOfFieldsToBeHidden = ["query_mode", "auto_stop", "disable_synonym", "auto_threshold", "enable_idf_score", "partial_match_rule"];
        for (var i = 0; i < listOfFieldsToBeHidden.length; i++)
            g_form.setDisplay(listOfFieldsToBeHidden[i], false);
    }
}
