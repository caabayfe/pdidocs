// update table label for sttrm_model
var docGr = new GlideRecord("sys_documentation");
docGr.addQuery("name", "sttrm_model");
docGr.addQuery("label", "State Transition Model");
docGr.addQuery("language", "en");
docGr.query();
if (docGr.next()) {
    docGr.setValue("label", "Model");
    docGr.setValue("plural", "Models");
    docGr.update();
    gs.log("Changed sys_documentation label for sttrm_model to Model");
}


// update label referring to sttrm_model
var columnsNeedToUpdateArr = [{
        table: "sttrm_model_user_criteria_hide_mtom",
        field: "",
        oldLabel: "Not Available For State Transition Model",
        newLabel: "Not Available For Model",
        newPlural: "Not Available For Models",
    },
    {
        table: "sttrm_model_user_criteria_read_mtom",
        field: "",
        oldLabel: "Available For State Transition Model",
        newLabel: "Available For Model",
        newPlural: "Available For Models",
    },
    {
        table: "sttrm_model_user_criteria_write_mtom",
        field: "",
        oldLabel: "Can write State Transition Model",
        newLabel: "Can write Model",
        newPlural: "Can write Models",
    },
    {
        table: "sttrm_model_user_criteria_hide_mtom",
        field: "sttrm_model",
        oldLabel: "State Transition Model",
        newLabel: "Model",
        newPlural: "Models",
        joinField: "user_criteria",
        oldMtomLabel: "Not Available For State Transition Model",
        newMtomLabel: "Not Available For Model",
        updateSysDictionary: true,
        updateSysCollection: true
    },
    {
        table: "sttrm_model_user_criteria_read_mtom",
        field: "sttrm_model",
        oldLabel: "State Transition Model",
        newLabel: "Model",
        newPlural: "Models",
        joinField: "user_criteria",
        oldMtomLabel: "Available For State Transition Model",
        newMtomLabel: "Available For Model",
        updateSysDictionary: true,
        updateSysCollection: true
    },
    {
        table: "sttrm_model_user_criteria_write_mtom",
        field: "sttrm_model",
        oldLabel: "State Transition Model",
        newLabel: "Model",
        newPlural: "Models",
        joinField: "user_criteria",
        oldMtomLabel: "Can write State Transition Model",
        newMtomLabel: "Can write Model",
        updateSysDictionary: true,
        updateSysCollection: true
    }
]


columnsNeedToUpdateArr.forEach(function(updateItem) {
    var documentGr = new GlideRecord("sys_documentation");
    documentGr.addQuery("name", updateItem.table);
    documentGr.addQuery("element", updateItem.field);
    documentGr.addQuery("label", updateItem.oldLabel);
    documentGr.addQuery("language", "en");
    documentGr.query();
    if (documentGr.next()) {
        documentGr.setValue("label", updateItem.newLabel);
        documentGr.setValue("plural", updateItem.newPlural);
        documentGr.update();
        gs.log("Changed sys_documentation label for " + updateItem.table + "." + updateItem.field + " to " + updateItem.newLabel);
    }

    if (updateItem.updateDictionary) {
        var dictionaryGr = new GlideRecord("sys_dictionary");
        dictionaryGr.addQuery("name", updateItem.table);
        dictionaryGr.addQuery("element", updateItem.field);
        dictionaryGr.addQuery("column_label", updateItem.oldLabel);
        dictionaryGr.query();
        if (dictionaryGr.next()) {
            dictionaryGr.setValue("column_label", updateItem.newLabel);
            dictionaryGr.update();
            gs.log("Changed sys_dictionary label for " + updateItem.table + "." + updateItem.field + " to " + updateItem.newLabel);
        }
    }

    if (updateItem.updateSysCollection) {
        var collectionGr = new GlideRecord("sys_collection");
        collectionGr.addQuery("collection", updateItem.table);
        collectionGr.addQuery("join_field", updateItem.joinField);
        collectionGr.addQuery("label", updateItem.oldMtomLabel);
        collectionGr.query();
        if (collectionGr.next()) {
            collectionGr.setValue("label", updateItem.newMtomLabel);
            collectionGr.update();
            gs.log("Changed sys_collection label for " + updateItem.table + "." + updateItem.field + " to " + updateItem.newMtomLabel);
        }
    }
});
