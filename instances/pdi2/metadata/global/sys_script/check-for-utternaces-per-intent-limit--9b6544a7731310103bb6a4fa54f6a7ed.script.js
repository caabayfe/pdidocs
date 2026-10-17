var tables = NLUConstants.tables;

(function executeRule(current, previous /*null when async*/ ) {

    var utterancesLimit = gs.getProperty('glide.nlu.utterances_per_intent.value_limit');
    if (utterancesLimit && !gs.nil(current.intent.model)) {
        utteranceGA = new GlideAggregate(tables.SYS_NLU_UTTERANCE);
        utteranceGA.addQuery('intent', current.intent);
        utteranceGA.addAggregate('COUNT');
        utteranceGA.query();
        if (utteranceGA.next()) {
            if (utteranceGA.getAggregate('COUNT') >= parseInt(utterancesLimit)) {
                gs.addErrorMessage(gs.getMessage('Maximum number of utterances allowed per intent is {0} ', utterancesLimit));
                current.setAbortAction(true);
            }
        }
    }

})(current, previous);
