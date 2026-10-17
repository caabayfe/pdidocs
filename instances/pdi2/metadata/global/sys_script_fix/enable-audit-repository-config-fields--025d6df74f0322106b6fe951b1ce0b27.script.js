enableAudit();
function enableAudit() {
    if (enableCollectionRecord())
		enableFieldRecords();
}
function enableCollectionRecord() {
    gs.info('Repository Configuration: executing fix script: enable audit for collection record');
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'sys_repo_config');
    gr.addNullQuery('element');
	gr.addQuery('audit', false);
    gr.query();
    // should be only 1 record
    if (gr.next()) {
        gr.audit = true;
        appendAttribute(gr, 'audit_type=whitelist');
        var success = gr.update();
        if (success) {
            gs.info('Repository Configuration: Updated dictionary entry for collection record to enable auditing');
			return true;
        } else {
            gs.error('Repository Configuration: Failed to update dictionary entry for collection record');
        }
    } else
		gs.info('Repository Configuration: Skipping due to collection record already audit enabled');

	return false;	
}
function enableFieldRecords() {
    var fields = 'current_ref,current_branch';
    gs.info("Repository Configuration: executing fix script: enable audit for fields: " + fields);
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'sys_repo_config');
    gr.addQuery('element', 'IN', fields);
    gr.query();
    while (gr.next()) {
        appendAttribute(gr, 'audit=true');
        var success = gr.update();
        if (success) {
            gs.info('Repository Configuration: Updated dictionary entry for ' + gr.element + ' to enable auditing');
        } else {
            gs.error('Repository Configuration: Failed to update dictionary entry for ' + gr.element);
        }
    }
}
function appendAttribute(gr, newAttribute) {
    var attributes = gr.attributes + '';
    if (!attributes.contains(newAttribute)) {
        if (attributes.length > 0 && !attributes.endsWith(','))
            attributes += ',';
        attributes += newAttribute;
        gr.attributes = attributes;
    }
}
