(function executeRule(current, previous /*null when async*/ ) {

    if (current.intent && current.intent.model) {
        (new NLUModel(current.intent.model)).setDirty();
    }

})(current, previous);
