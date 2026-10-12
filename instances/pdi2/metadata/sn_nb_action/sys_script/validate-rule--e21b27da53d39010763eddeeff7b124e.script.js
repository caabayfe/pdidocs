(function executeRule(current, previous /*null when async*/ ) {

    var nextBestActionService = new sn_nb_action.NextBestActionService();
    if (!nextBestActionService.isValidRule(current)) {
        current.setAbortAction(true);
    }

})(current, previous);
