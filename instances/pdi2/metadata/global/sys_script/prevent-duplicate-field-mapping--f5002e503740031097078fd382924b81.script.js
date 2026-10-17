(function executeRule(current, previous /*null when async*/) {
    var gr = new GlideRecord('sys_di_impl_field_mapping');
    gr.addQuery('interface_impl_binding', current.interface_impl_binding);
    gr.addQuery('source_field', current.source_field);
	gr.addQuery('sys_id', '!=', current.sys_id);
    gr.setLimit(1);
    gr.query();

    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage(
			"A field mapping for this interface field already exists on this binding"));
			current.setAbortAction(true);
    }
})(current, previous);
