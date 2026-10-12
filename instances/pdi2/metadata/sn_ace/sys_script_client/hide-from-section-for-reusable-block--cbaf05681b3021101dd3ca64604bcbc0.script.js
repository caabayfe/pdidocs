function onLoad() {
    var REUSABLE_BLOCK_DEFINITION_SYS_ID = '5db4a12153975110c733ddeeff7b1277';

    if (g_form.getValue('type') == REUSABLE_BLOCK_DEFINITION_SYS_ID) {
        g_form.setSectionDisplay('configuration', false);
        g_form.setSectionDisplay('advanced', false);
		var properties = [{"defaultValue": "incident", "fieldType": "string","label": "Table","mandatory": true,"name": "table"}];
		g_form.addInfoMessage(getMessage('Add Block Variable as {0}', JSON.stringify(properties)));
    }



}
