(function executeRule(current, previous /*null when async*/ ) {

    (new NLUModel(current.utterance.intent.model)).setDirty();

})(current, previous);
