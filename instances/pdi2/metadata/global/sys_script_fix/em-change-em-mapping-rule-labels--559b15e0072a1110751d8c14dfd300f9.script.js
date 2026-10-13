var logMessagePrefix = "EM Fix Script - Change 'em_mapping_rule' labels: ";

function processTable(tableName) {
    gs.log(logMessagePrefix + "Starting changing the '" + tableName + "' table's elements labels.");

    // Validates the table exist
    var gr = new GlideRecord(tableName);
    if (gr.isValid()) {
        // Change every given label
        var columnLabels = {
            "From field": "Source field",
            "To field": "Target field"
        };
        for (var label in columnLabels) {
            changeColumnLabel(tableName, label, columnLabels[label]);
        }

        // Change mapping_type choice labels
        var choiceLabels = {
            "Single field": "Map field and transform value (Single field)",
            "Constant": "Create or update field and set constant value (Constant)",
            "Copy Field": "Map field (Copy field)"
        };
        for (label in choiceLabels) {
            var element = "mapping_type";
            changeChoicesLabel(tableName, element, label, choiceLabels[label]);
        }
    } else {
        gs.log(logMessagePrefix + "The table '" + tableName + "' does not exists");
    }
    gs.log(logMessagePrefix + "Ended changing the '" + tableName + "' table's elements labels.");
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

function changeChoicesLabel(tableName, elementName, fromLabel, toLabel) {
    var choiceGr = new GlideRecord("sys_choice");
    choiceGr.addQuery("name", tableName);
    choiceGr.addQuery("element", elementName);
    choiceGr.addQuery("label", fromLabel);
    choiceGr.query();
    if (choiceGr.next()) {
        choiceGr.setValue("label", toLabel);
        choiceGr.update();
        gs.log(logMessagePrefix + "The label '" + fromLabel + "' of '" + elementName + "' element in " + tableName + "' table has been changed to '" + toLabel + "'.");
        return;
    }
    gs.log(logMessagePrefix + "The label '" + fromLabel + "' of '" + elementName + "' element in " + tableName + "' table wasn't found.");
}

processTable('em_mapping_rule');
