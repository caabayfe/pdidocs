function onClick() {

    var tableName = '';
    var sysId = '';
    var safeLocation = null;

    if (typeof g_form !== 'undefined') {
        sysId = g_form.getUniqueValue();
        tableName = g_form.getTableName();
    } else {

        try {
            if (globalThis && globalThis.location)
                safeLocation = globalThis.location;
            else if (parent && parent.location)
                safeLocation = parent.location;
            else if (top && top.location)
                safeLocation = top.location;
        } catch (e) {}

        var path = safeLocation ? safeLocation.pathname : '';
        var match = path.match(/\/record\/([^\/]+)\/([0-9a-fA-F]{32})/);

        if (match) {
            tableName = match[1];
            sysId = match[2];
        }
    }

    var fields = [{
        type: 'reference',
        name: 'document',
        label: getMessage('Select documents'),
        mandatory: true,
        reference: 'ds_document',
        referringTable: 'ds_document_references',
        referringRecordId: sysId,
        query: 'active=true'
    }];

    g_modal.showFields({
        title: getMessage('Link Documents'),
        fields: fields,
        size: 'lg'
    }).then(function(fieldValues) {
        var selectedDocumentSysId = fieldValues.updatedFields[0].value;
        insert(selectedDocumentSysId);
    });


    function insert(documentId) {
        var ga = new GlideAjax('DocumentObjectManager');
        ga.addParam('sysparm_name', 'insertReference');
        ga.addParam('sysparm_document_sys_id', documentId);
        ga.addParam('sysparm_table_name', tableName);
        ga.addParam('sysparm_target_record', sysId);
        ga.getXMLAnswer(afterInsert);
    }

    function afterInsert(insertedSysId) {
        if (typeof g_form !== 'undefined')
            g_form.reload();
        else if (safeLocation && safeLocation.reload)
            safeLocation.reload();
    }
}
