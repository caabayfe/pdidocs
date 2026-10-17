(function executeRule(current, previous /*null when async*/ ) {

    var scoresFormat = current.scores_format.toString();
    if (scoresFormat.length !== 6 || scoresFormat.match('^[a-zA-Z]{6}$') == null) {
        gs.addErrorMessage(gs.getMessage('Invalid number format. It must be 6 characters representing the International System of Units (ex:kMGTPE)'));
        current.setAbortAction(true);
    }

})(current, previous);
