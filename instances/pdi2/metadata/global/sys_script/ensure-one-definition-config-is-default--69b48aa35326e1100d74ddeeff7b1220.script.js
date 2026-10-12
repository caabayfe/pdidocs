(function executeRule(current, previous /*null when async*/ ) {
    if (current.getValue('default') == true) {
        // If the current record's default value is set to true, then verify if any other record has default=true, then abort the operation
        var gr = new GlideRecord('sys_one_extend_definition_config');
        gr.addQuery('default', true);
        gr.addQuery('capability', current.getValue("capability"));
        if(current.operation() == "update" && (current.getValue('default') == previous.getValue('default'))) {
            // if default is not changed for the current record, ignore the current record in the query
            gr.addQuery('sys_id', '!=', current.getUniqueValue());
        }
        gr.query();
        if (gr.getRowCount() > 0) {
            gs.addErrorMessage(gs.getMessage('Only one definition config record can be set to default'));
            current.setAbortAction(true);
        }
    }

})(current, previous);
