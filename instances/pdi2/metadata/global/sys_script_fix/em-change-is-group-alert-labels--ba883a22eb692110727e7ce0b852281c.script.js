var logMessagePrefix = "EM Fix Script - Change is_group_alert labels: ";
var logMsg = '';
var EM_ALERT_TABLE = "em_alert";
var EM_ALERT_HIST_TABLE = "em_alert_history";
var DICTIONARY_TABLE = "sys_dictionary";
var DOCUMENTATION_TABLE = "sys_documentation";
var IS_GROUP_ALERT_COLUMN = "is_group_alert";
var NEW_LABEL = "Is Generated Alert";
var NEW_HINT = "Indicates that the alert is a group alert that was generated automatically by the system";

function process() {
    logMsg = logMessagePrefix + "Start changing the is_group_alert column labels and hints at " + new GlideDateTime().toString() + ".\n";

    var tables = [EM_ALERT_TABLE, EM_ALERT_HIST_TABLE];

    for (var i in tables) {
        changeColumnLabelInDictionaryTable(tables[i]);
        changeColumnHintInDocumentationTable(tables[i]);
    }

    logMsg += "Finished changing the is_group_alert column labels and hints at " + new GlideDateTime().toString() + ".";
    gs.info(logMsg);
}

function changeColumnLabelInDictionaryTable(tableName) {
    var dictGr = new GlideRecord(DICTIONARY_TABLE);
    dictGr.addQuery("name", tableName);
    dictGr.addQuery("element", IS_GROUP_ALERT_COLUMN);
    dictGr.query();

    if (dictGr.next()) {
        var fromLabel = dictGr.getValue("column_label");

        if (fromLabel != NEW_LABEL) {
            dictGr.setValue("column_label", NEW_LABEL);
            dictGr.update();
            logMsg += DICTIONARY_TABLE + ": The label of the '" + IS_GROUP_ALERT_COLUMN + "' column of the table '" + tableName +
                "' has been changed from '" + fromLabel + "' to '" + NEW_LABEL + "'.\n";
        } else {
            logMsg += DICTIONARY_TABLE + ": The label '" + fromLabel + "' of the '" + IS_GROUP_ALERT_COLUMN + "' column of the table '" + tableName +
                "' is the same as the new label, hence doesn't need to be changed.\n";
        }
    } else {
        logMsg += DICTIONARY_TABLE + ": The column '" + IS_GROUP_ALERT_COLUMN + "' of the '" + tableName + "' table wasn't found.\n";
    }
}

function changeColumnHintInDocumentationTable(tableName) {
    var docGr = new GlideRecord(DOCUMENTATION_TABLE);
    docGr.addQuery("name", tableName);
    docGr.addQuery("element", IS_GROUP_ALERT_COLUMN);
    docGr.query();
    if (docGr.next()) {
        var fromHint = docGr.getValue('hint');

        if (fromHint != NEW_HINT) {
            docGr.setValue("hint", NEW_HINT);
            docGr.update();

            logMsg += DOCUMENTATION_TABLE + ": The hint of the '" + IS_GROUP_ALERT_COLUMN + "' column of the table '" + tableName +
                "' has been changed from '" + fromHint + "' to '" + NEW_HINT + "\n";
        } else {
            logMsg += DOCUMENTATION_TABLE + ": The hint '" + fromHint + "' of the '" + IS_GROUP_ALERT_COLUMN + "' column of the table '" + tableName +
                "' is the same as the new hint, hence doesn't need to be changed.\n";
        }
    } else {
        logMsg += DOCUMENTATION_TABLE + ": The column '" + IS_GROUP_ALERT_COLUMN + "' of the '" + tableName + "' table wasn't found.\n";
    }
}

process();
