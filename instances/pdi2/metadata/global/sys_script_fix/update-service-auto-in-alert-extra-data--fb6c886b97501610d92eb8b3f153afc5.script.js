var LOG_PREFIX = 'fix_csdm5_service_auto_label_in_em_alert_extra_data: ';

/**
 * 
 * @param {String} table the name of the table in the schema.
 * @param {String} field the name of the field in the schema.
 * @param {String} prevLabel if current label isn't equal this value, the renaming is skipped.
 * @param {String} newLabel
 */
function renameFieldLabel(table, field, prevLabel, newLabel) {
    var dictObj = new GlideRecord("sys_dictionary");
    dictObj.addQuery("name", table);
    dictObj.addQuery("element", field);
    dictObj.query();

    if (!dictObj.next()) {
        gs.info(LOG_PREFIX + 'Could not find entry in sys_dictionary for table ' + table + ' and field ' + field +
            '.\nSkipping field label change.');
        return;
    }

    var currLabel = String(dictObj.getValue("column_label"));

    //already changed, skip
    if (currLabel.toLowerCase() === newLabel.toLowerCase())
        return;

    if (currLabel.toLowerCase() !== prevLabel.toLowerCase()) {
        gs.info(LOG_PREFIX + 'table field ' + table + '.' + field + ' appears to have customized label. Expected: ' + prevLabel + ', having: ' + currLabel +
            '\nSkipping field label change.');
        return;
    }

    dictObj.setValue("column_label", newLabel);
    dictObj.update();

    gs.info(LOG_PREFIX + 'Modified field label for table ' + table + ' field ' + field + ' from \'' + currLabel + '\' to \'' + newLabel + '\'.');
}

function execute() {
    var scope = gs.getCurrentScopeName();
    if ("rhino.global" != scope) {
        gs.info(LOG_PREFIX + 'skipping because not in global scope: ' + scope);
        return;
    }
    gs.info(LOG_PREFIX + 'started fix run.');
    var table = 'em_alert_extra_data';
	var field = 'application_service';
    renameFieldLabel(table, field, 'Application Service', 'Service Instance');
    gs.info(LOG_PREFIX + 'finished fix run.');
}
execute();
