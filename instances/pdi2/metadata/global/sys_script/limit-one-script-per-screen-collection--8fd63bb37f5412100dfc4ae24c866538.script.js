(function executeRule(current, previous /*null when async*/ ) {

    var screenTypeId = current.getValue('screen_type');
    var gr = new GlideRecord('sys_ux_screen_type_condition_script');
    gr.addQuery('screen_type', screenTypeId);
    gr.query();

    if (gr.getRowCount() > 0) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Each Screen Collection can have only one Screen Collection Condition Script'));
    }

})(current, previous);
