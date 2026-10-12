(function executeRule(current, previous /*null when async*/ ) {
    gs.addErrorMessage(gs.getMessage("'{0}' field must be disabled for '{1}' property",
        ['Ignore Cache', 'glide.prediction_service.url.prefix']));
    current.setAbortAction(true);

})(current, previous);
