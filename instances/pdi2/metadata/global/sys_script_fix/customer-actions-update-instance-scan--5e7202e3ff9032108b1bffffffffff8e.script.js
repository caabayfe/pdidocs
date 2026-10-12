runScript();

function runScript() {
    gs.log("Security scanner update: fix script started");
    var activityIdList = ['36de68e743907110adf71f062bb8f2b0', '32af682b43907110adf71f062bb8f2ec', 'a7be68e743907110adf71f062bb8f2b8'];

    var activityContextGr = new GlideRecord('sys_pd_activity_context');
    activityContextGr.addQuery('activity_id', activityIdList);
    activityContextGr.query();
    while (activityContextGr.next()) {
        var contextSysId = activityContextGr.getValue('sys_id');
        updateVariableValue(contextSysId);
    }

    function updateVariableValue(id) {
        var variableGr = new GlideRecord('sys_variable_value');
        variableGr.addQuery('document_key', id);
        variableGr.addQuery('document', 'sys_pd_activity_context');
        variableGr.addQuery('variable', '267e68875b00001070e4492c11f91a34');
        variableGr.query();
        if (variableGr.next()) {
            var text = variableGr.value;
            var sysId = variableGr.sys_id;
            var updatedValue = text.replace('Instance Scan', 'Security scanner');
            variableGr.setValue('value', updatedValue);
            if (variableGr.update()) {
                gs.log("Security scanner update: fix script updated Instance Scan text to Security scanner for variable sys_id: " + sysId);
            }
        }
    }
    gs.log("Security scanner update: fix script completed");
}
