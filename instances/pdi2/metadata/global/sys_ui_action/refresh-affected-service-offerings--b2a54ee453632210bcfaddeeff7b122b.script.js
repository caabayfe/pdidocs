(function executeRule() {
    try {
        if (!current || !current.isValidRecord()) {
            gs.addErrorMessage(gs.getMessage('Invalid outage record'));
            action.setRedirectURL(current);
            return;
        }

        var utils = new global.OutageServiceOfferingUtils();
        var result = utils.refreshAffectedServiceOfferings(current);

        action.setRedirectURL(current);

    } catch (ex) {
        gs.error("Error in UI Action: " + ex);
        gs.addErrorMessage(gs.getMessage('Error in refresh operation: {0}', [ex]));
        action.setRedirectURL(current);
    }
})();
