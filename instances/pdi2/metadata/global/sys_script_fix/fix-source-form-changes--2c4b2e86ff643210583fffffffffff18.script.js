function addHintToField(tableName, fieldName, hint) {
    var docGr = new GlideRecord('sys_documentation');
    var qc = docGr.addQuery('name', tableName);
    docGr.addQuery('element', fieldName);
    docGr.query();
    while (docGr.next()) {
        docGr.hint = hint;
        docGr.update();
        gs.log('Added hint for ' + fieldName + ' on ' + tableName);
    }
}

function addReadOnlyToField(tableName, fieldName) {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', tableName);
    gr.addQuery('element', fieldName);
    gr.query();
    if (gr.next()) {
        gr.setValue('read_only', 'true');
        gr.update();
    }
}

function setMandatory(tableName, fieldName) {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', tableName);
    gr.addQuery('element', fieldName);
    gr.query();
    if (gr.next()) {
        gr.setValue('mandatory', 'true');
        gr.update();
    }
}

function updateColumnLabel(tableName, fieldName, newLabel) {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', tableName);
    gr.addQuery('element', fieldName);
    gr.query();
    if (gr.next()) {
        gr.setValue('column_label', newLabel);
        gr.update();
    }
}

function updateRetentionDays() {
	var gr = new GlideRecord('pa_dm_analytics_source');
	gr.addEncodedQuery("retention_days<=0");
	gr.query();
	gr.setValue('retention_days', 730); //default retention days. 
	gr.updateMultiple();
}

(function() {
    var LOG_PREFIX = "DSSourceFormChanges: ";
    if (pm.isZboot()) {
        gs.log(LOG_PREFIX + "Source Form changes not required, this is a zboot instance.");
        return;
    }

    gs.log(LOG_PREFIX + 'STARTED');
    var tableName = "pa_dm_analytics_source";
    updateColumnLabel(tableName, "dimensions", "Fields");
    addHintToField(tableName, "dimensions", "Choose fields that act as dimensions and metrics when building KPIs from this source");
    addReadOnlyToField(tableName, "name");
    addReadOnlyToField(tableName, "is_conversion_source");
    setMandatory(tableName, "retention_days");
    updateRetentionDays();
    gs.log(LOG_PREFIX + 'ENDED');
})();
