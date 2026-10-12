(function executeRule(current, previous /*null when async*/ ) {
	// Business rule gets called for insert/update
    if (current.operation() == "insert") {
        validate(current);
    } else { // update scenario
        var mandatoryAttrsChanged = current.active.changes() || current.applies_to.changes() || current.discovery_source.changes();
        if (mandatoryAttrsChanged) {
            // Need to verify the unique key
            validate(current);
        }
    }
})(current, previous);

function validate(current) {
    var gr = new GlideRecord('cmdb_ire_data_source_rule');
    gr.addQuery('applies_to', current.getValue('applies_to'));
    gr.addQuery('discovery_source', current.getValue('discovery_source'));
    gr.addQuery('active', current.getValue('active'));
    gr.query();
    // Found an active data source with same table, not continuing further
    if (gr.next()) {
        var params = [JSUtil.getBooleanValue(current,'active'), current.getValue('discovery_source'), current.getValue('applies_to')];
        gs.addErrorMessage(gs.getMessage("Rule with Active:[{0}], Data source:[{1}], CMDB table:[{2}] already exists", params));
        current.setAbortAction(true);
    }
}
