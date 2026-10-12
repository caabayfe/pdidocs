(function executeRule(current, previous /*null when async*/ ) {
    var utterance = NLUStudioTrainer.deserialiseUtterance(current.getValue('utterance'));
    var gr = new GlideRecord('sys_nlu_utterance');
    gr.addQuery('intent', current.intent);
    gr.addQuery('sys_id', '!=', current.sys_id);
    gr.query();
    while (gr.next()) {
        if (utterance.toString() === NLUStudioTrainer.deserialiseUtterance(gr.getValue("utterance"))) {
            gs.addErrorMessage(gs.getMessage('Utterance already exists.'));
            current.setAbortAction(true);
            break;
        }
    }
})(current, previous);
