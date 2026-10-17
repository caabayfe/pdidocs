(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('sn_dt_translator_configuration');
    gr.addQuery('default_detection', true);
    gr.query();
    while (gr.next()) {
        if (current.getValue('sys_id') !== gr.getValue('sys_id')) {
            gs.addErrorMessage(gs.getMessage("You can configure only one default translator for detection"));
            current.setAbortAction(true);
			break;
        }
    }

})(current, previous);
