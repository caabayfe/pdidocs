(function executeRule(current, previous /*null when async*/ ) {

    global.NLUModel.updateSecondaryModelStatus(current.document, current.target_language, 'draft');

})(current, previous);
