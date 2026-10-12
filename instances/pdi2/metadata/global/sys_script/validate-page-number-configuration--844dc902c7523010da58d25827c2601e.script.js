(function executeRule(current, previous /*null when async*/ ) {
    var isValid = validate(current);

    if (!isValid)
        current.setAbortAction(true);

    function validate(pageNumberConfigGr) {
        if (pageNumberConfigGr.start_page_number < 1) {
            gs.addErrorMessage(gs.getMessage("Please choose a value greater than zero for Start numbering from page"));
            return false;
        }
        return true;
    }
})(current, previous);
