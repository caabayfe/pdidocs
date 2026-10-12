/*

From:
----
{
    "groupName": "Basic Info",
    "label": "Description",
    "groupTable": "sys_nlu_model",
    "groupTableSysId": "413d9b6e7c11a010f87714b4a07e7586",
    "fieldInfo": [
        {
            "originalValue": "The HR Model provides support for understanding intent of the requestor related to selected HR services.",
            "table": "sys_nlu_model",
            "sysId": "413d9b6e7c11a010f87714b4a07e7586",
            "field": "description",
            "translatedValue": null,
            "isFieldLocked": false
        }
    ]
}

To:
---
{
    "groupName": "Basic Info",
    "label": "Description",
    "fieldInfo": [
        {
            "originalValue": "The HR Model provides support for understanding intent of the requestor related to selected HR services.",
            "translatedValue": null,
            "isFieldLocked": false,
            "additionalParameters": {
                "table": "sys_nlu_model",
                "sysId": "413d9b6e7c11a010f87714b4a07e7586",
                "field": "description"
            }
        }
    ],
    "additionalParameters": {
        "groupTableSysId": "413d9b6e7c11a010f87714b4a07e7586",
        "groupTable": "sys_nlu_model"
    }
}
*/


(function() {

    if (pm.isZboot()) {
        return;
    }

    var tables = NLUConstants.tables;
    var gr = new GlideRecord(tables.SN_LF_TASK);
    gr.addQuery('table_name', tables.SYS_NLU_MODEL);
    gr.addNullQuery('closed_at');
    gr.query();

    while (gr.next()) {
        var docContentStr = gr.getValue('document_content');
        if (docContentStr) {
            var docContent = JSON.parse(docContentStr);

            if (docContent.content && docContent.content.length > 0) {
                docContent.content = docContent.content.map(function(eachContent) {
                    eachContent.additionalParameters = {
                        groupTableSysId: eachContent.groupTableSysId,
                        groupTable: eachContent.groupTable
                    };
                    delete eachContent.groupTableSysId;
                    delete eachContent.groupTable;

                    eachContent.fieldInfo = eachContent.fieldInfo.map(function(eachFeild) {
                        eachFeild.additionalParameters = {
                            table: eachFeild.table,
                            sysId: eachFeild.sysId,
                            field: eachFeild.field
                        };
                        delete eachFeild.table;
                        delete eachFeild.sysId;
                        delete eachFeild.field;
                        return eachFeild;
                    });

                    return eachContent;
                });
            }

            gr.setValue('document_content', JSON.stringify(docContent));
            gr.update();
        }
    }

})();
