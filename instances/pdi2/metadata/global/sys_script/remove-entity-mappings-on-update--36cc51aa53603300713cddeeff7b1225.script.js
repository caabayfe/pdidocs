(function executeRule(current, previous /*null when async*/ ) {
    var prevUtterance = NLUStudioTrainer.deserialiseUtterance(previous.getValue('utterance'));
    var newUtterance = NLUStudioTrainer.deserialiseUtterance(current.getValue('utterance'));
    if (prevUtterance !== newUtterance) {
        var gr = new GlideRecord('m2m_sys_nlu_utterance_entity');
        gr.addQuery('utterance', previous.getValue('sys_id'));
        gr.deleteMultiple();
    }
})(current, previous);
