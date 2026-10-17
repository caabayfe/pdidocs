(function executeRule(current, previous /*null when async*/ ) {

    (new NLUModel(current.intent.model)).setDirty();

})(current, previous);
