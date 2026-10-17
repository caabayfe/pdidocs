var logMessagePrefix = "EM Fix Script - Change 'em_mapping_pair' labels: ";

function processTable(tableName) {
    gs.log(logMessagePrefix + "Start changing the '" + tableName + "' table's elements labels.");

    // Validates the table exist
    var gr = new GlideRecord(tableName);
    if (gr.isValid()) {

        // Change labels
        var columnLabels = {
            "Key": "From value",
            "Value": "To value"
        };
        for (var label in columnLabels) {
            changeColumnLabel(tableName, label, columnLabels[label]);
        }

        // Change table's label
        changeTableLabel(tableName, "Event Mapping Pair", "Transform value pair");

    } else {
        gs.log(logMessagePrefix + "The table '" + tableName + "' does not exists");
    }
    gs.log(logMessagePrefix + "End changing the '" + tableName + "' table's elements labels.");
}

function changeColumnLabel(tableName, fromLabel, toLabel) {
    var dictGr = new GlideRecord("sys_dictionary");
    dictGr.addQuery("name", tableName);
    dictGr.addQuery("column_label", fromLabel);
    dictGr.query();
    if (dictGr.next()) {
        dictGr.setValue("column_label", toLabel);
        dictGr.update();
        gs.log(logMessagePrefix + "The column label '" + fromLabel + "' of '" + tableName + "' table has been changed to '" + toLabel + "'.");
        return;
    }
    gs.log(logMessagePrefix + "The column label '" + fromLabel + "' of '" + tableName + "' table wasn't found.");
}

function changeTableLabel(tableName, fromLabel, toLabel) {
    var docGr = new GlideRecord('sys_documentation');
    docGr.addQuery('name', tableName);
    docGr.addQuery("label", fromLabel);
    docGr.query();
    if (docGr.next()) {
        docGr.setValue("label", toLabel);
        docGr.update();
        gs.log(logMessagePrefix + "The label '" + fromLabel + "' of '" + tableName + "' table has been changed to '" + toLabel + "'.");
        return;
    }
    gs.log(logMessagePrefix + "The label '" + fromLabel + "' of '" + tableName + "' table wasn't found.");
}

processTable('em_mapping_pair');
