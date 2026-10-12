(function executeRule(current, previous /*null when async*/ ) {

    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage("Usage of Input Form Screen with Presentation Style 'Screen' as Parameter Screen is not supported."));

})(current, previous);
