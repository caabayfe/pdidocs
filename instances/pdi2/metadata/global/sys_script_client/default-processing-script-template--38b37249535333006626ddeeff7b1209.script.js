function onLoad() {
    //Type appropriate comment here, and begin script below
    var onCreationScript = '' + g_form.getValue('post_process_script');
    // if there's already a script here, just fix the names...
    if (onCreationScript == '') {
        onCreationScript = createScript();
    }
    g_form.setValue('post_process_script', onCreationScript);
    var onEditScript = '' + g_form.getValue('on_edit_script');
    if (onEditScript == '') {
        onEditScript = createScript();
    }
    var preEditScript = '' + g_form.getValue('pre_edit_script');
    if (preEditScript == '') {
        preEditScript = preEditingScript();
    }
    g_form.setValue('on_edit_script', onEditScript);
    g_form.setValue('pre_edit_script', preEditScript);

	// set info message for test action
	g_form.showFieldMsg('test_action',getMessage('Test action should use a single alias that the configuration template is attached to.','info'));
}

function createScript() {
    var script = '(function execute(aliasId, connectionSysId, jsonDefaultData, jsonDynamicData) {\n';
    script += '   // aliasId: sys_id of the alias record\n';
    script += '   // connectionSysId: sys_id of the connection record created by using the default and dynamic data\n';
    script += '   // jsonDefaultData (String): The default JSON template data from template table\n';
    script += '   // e.g. var jsonDefaultParsed = JSON.parse(jsonDefaultData);\n';
    script += '   //      gs.info("default connection url = " + jsonDefaultParsed["connection"]["connection_url"]);\n';
    script += '   // jsonDynamicData (String): User input based on the key/values defined in "Dynamic Data"\n';
    script += '   // e.g. var jsonDynamicParsed = JSON.parse(jsonDynamicData);\n';
    script += '   //      gs.info("dynamic connection url = " + jsonDynamicParsed["connection.connection_url"]);\n';
    script += '})(aliasId, connectionSysId, jsonDefaultData, jsonDynamicData);\n';
    return script;
}

function preEditingScript() {
    var script = '(function execute(aliasId, connectionSysId, jsonDefaultData, jsonDynamicData) {\n';
    script += '   // aliasId: sys_id of the alias record.\n';
    script += '   // connectionSysId: sys_id of the connection record created by using the default and dynamic data.\n';
    script += '   // jsonDefaultData (String): The default JSON template data from template table.\n';
    script += '   // e.g. var jsonDefaultParsed = JSON.parse(jsonDefaultData);\n';
    script += '   //      gs.info("default connection url = " + jsonDefaultParsed["connection"]["connection_url"]);\n';
    script += '   // jsonDynamicData (String): Current values of Connection and Credential fields (except Password fields) based on the key-value pairs defined in "Dynamic Data".\n';
    script += '   // e.g. var jsonDynamicParsed = JSON.parse(jsonDynamicData);\n';
    script += '   //      gs.info("dynamic connection url = " + jsonDynamicParsed["connection.connection_url"]);\n\n';
    script += '   //returns array of objects. Each object has name-value pairs for populating additional fields values in connections dashboard in the edit view.\n';
    script += '   //In this example script, additionalField1, additionalField2 are additional fields.\n';
    script += '   //Here we define calcAdditionalField1(), calcAdditionalField2() functions in the script\n';
    script += '   //to calculate current values for additionalField1, additionalField2.\n\n';
    script += '   //return [{\n';
    script += '   //         name: "additionalField1"\n';
    script += '   //         value: calcAdditionalField1(),\n';
    script += '   //    },\n';
    script += '   //    {\n';
    script += '   //         name: "additionalField2"\n';
    script += '   //         value: calcAdditionalField2(),\n';
    script += '   //    }\n';
    script += '   //];\n\n';
    script += '   return [];\n';
    script += '})(aliasId, connectionSysId, jsonDefaultData, jsonDynamicData);\n';
    return script;
}
