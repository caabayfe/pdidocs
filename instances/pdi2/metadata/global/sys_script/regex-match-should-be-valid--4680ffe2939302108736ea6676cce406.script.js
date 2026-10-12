(function onBefore(current, previous /*null when async*/ ) {
    var value = current.matches_regex;
    try {
        // Try to create a RegExp object with the input string
        new RegExp(value);
    } catch (e) {
        gs.addErrorMessage(gs.getMessage("Invalid regex input: {0}", value));
        current.active = false;
        current.setAbortAction(true);
    }
})(current, previous);
            
