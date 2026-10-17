function onLoad() {
    //Load tables for Machine Identity Access Control
    var ga = new GlideAjax('global.GetTableNames');
    ga.getXML(loadTables);
}

function loadTables(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    var tableList = JSON.parse(answer);
    g_form.clearOptions('sys_security_machine_identity_access_control.tables');
    var choiceList = getChoiceList();
    for (var i = 1; i < tableList.length + 1; i++) {
        var table = tableList[i - 1];
        choiceList[i] = new Option(table.label, table.value);
    }
}

function getChoiceList() {
    return g_form.getElement('choice.sys_security_machine_identity_access_control.tables').options;
}
