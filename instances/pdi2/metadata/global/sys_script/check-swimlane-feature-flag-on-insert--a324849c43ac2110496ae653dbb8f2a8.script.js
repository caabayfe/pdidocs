(function executeRule(current, previous /*null when async*/ ) {
    var areSwimlanesEnabled = gs.getProperty("com.glide.pad.core.model.enableSwimlanes", false);
    if (areSwimlanesEnabled !== 'true') {
        current.setAbortAction(true);
        gs.addErrorMessage(
            gs.getMessage(
                "Swimlanes cannot be created while swimlanes are disabled."));
    }
})(current, previous);
