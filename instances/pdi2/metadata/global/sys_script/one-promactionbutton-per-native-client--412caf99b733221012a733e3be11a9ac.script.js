(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('sys_sg_button_instance');
    gr.addQuery('parent', current.parent);
    gr.addQuery('location', current.location);
    gr.query();
    if (gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
        gs.addErrorMessage(gs.getMessage('Each native client (mobile app type) can have only one Prominent Action button'));
        current.setAbortAction(true);
    }

})(current, previous);
