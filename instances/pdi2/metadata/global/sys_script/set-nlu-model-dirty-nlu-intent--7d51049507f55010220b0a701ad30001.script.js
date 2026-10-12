(function executeRule(current, previous /*null when async*/ ) {

    (new NLUModel(current.model)).setDirty();

})(current, previous);
