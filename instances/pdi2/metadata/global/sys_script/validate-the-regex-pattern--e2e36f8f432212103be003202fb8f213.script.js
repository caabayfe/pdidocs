(function executeRule(current, previous /*null when async*/ ) {

    try {
        new RegExp(current.pattern, 'j');
    } catch (ex) {
		 gs.addErrorMessage(gs.getMessage("Invalid regular expression pattern: {0}", ex.message));

        current.setAbortAction(true);
    }


})(current, previous);
