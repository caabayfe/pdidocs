(function executeRule(current, previous /*null when async*/ ) {
    var generator = new GeneratorService(current);
    var res = generator.isValid();
    if (!res.isValid) {
        var errorMessage = res.errorMessage;
        if (errorMessage) {
            gs.addErrorMessage(errorMessage);
        }
        current.setAbortAction(true);
    }
})(current, previous);
