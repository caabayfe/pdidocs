function onLoad() {
    //Type appropriate comment here, and begin script below
    if (g_form.getBooleanValue("apply_all_tables")) {
        return;
    }

    g_form.addInfoMessage("Loading tables");
    var ga = new GlideAjax('global.GetTableNames');
    ga.getXML(loadTables);

}

function loadTables(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    var tableList = JSON.parse(answer);
    var choiceList = getChoiceList();
    for (var i = 1; i < tableList.size() + 1; i++) {
        var table = tableList[i - 1];
        choiceList[i] = new Option(table.label, table.value);
    }
    g_form.clearMessages();
}

function getChoiceList() {
    return g_form.getElement('choice.sys_api_access_policy.api_tablename').options;
}
