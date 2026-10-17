(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('sys_pd_process_variant');
    gr.addQuery('process_definition', current.process_definition);
    gr.addQuery('parent_variant', current.parent_variant);
    gr.query();
    var siblingCount = 0;
    while (gr.next()) {
        siblingCount++;
    }
    if (siblingCount >= 100) {
        gs.addErrorMessage(gs.getMessage('Unable to add variant. Maximum sibling variants reached.'));
        current.setAbortAction(true);
    }

})(current, previous);
