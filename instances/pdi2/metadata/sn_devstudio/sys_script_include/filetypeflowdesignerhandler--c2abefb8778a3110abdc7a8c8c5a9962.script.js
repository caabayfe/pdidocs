var FileTypeFlowDesignerHandler = function(appId) {
    var workflowType = 'sys_hub_flow';
    var filesByNavKey = loadFiles();

    function loadFiles() {
        var gr = new GlideRecord(workflowType);
        if (appId) {
            gr.addQuery('sys_scope', appId);
            gr.query();
        }

        var filesByNavKey = {};
        while (gr.next()) {
            var file = fileForRecord(gr);
            var navigationKey = gr.getValue('sys_class_name');
            if (!filesByNavKey[navigationKey])
                filesByNavKey[navigationKey] = [];
            filesByNavKey[navigationKey].push(file);
        }
        return filesByNavKey;
    }

    function filesForKey(navigationKey) {
        return filesByNavKey[navigationKey];
    }

    function fileForRecord(record) {
        var sysId = record.getUniqueValue();

        var name = record.getValue('sys_name');
        if (!name || name.trim() === '')
            name = sysId;

        var recordType = record.getValue('sys_class_name');

        var flowType = record.getValue('type');

        return FileTypeFileBuilder.newFile()
            .withId(recordType + '.' + sysId)
            .withName(name)
            .withSysId(sysId)
            .addCustom("type", flowType)
            .build();

    }

    return {
        filesForKey: filesForKey
    };

};
