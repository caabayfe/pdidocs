(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('sys_pd_process_variant');
    let parent = current.parent_variant;
    var level = 2;
    while (parent) {
        level++;
        gr.get(parent);
        parent = gr.parent_variant;
    }

    if (level > 7) {
        gs.addErrorMessage(gs.getMessage('Unable to add variant. Maximum child variant levels reached.'));
        current.setAbortAction(true);
    }

})(current, previous);
