(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('sn_dt_translator_configuration');
    gr.addQuery('name', current.name);
    gr.query();
    while (gr.next()) {
        if (current.getValue('sys_id') !== gr.getValue('sys_id') && current.getValue('sys_overrides') !== gr.getValue('sys_id')) {
            gs.addErrorMessage(gs.getMessage("A translator already exists with the name, '{0}'", [gr.getValue('name')]));
            current.setAbortAction(true);
			break;
        }
    }


})(current, previous);
