(function executeRule(current, previous /*null when async*/ ) {

    var choicesRaw = current.choices.toString();
    var submittedValue = current.value.toString().trim();

    if (!choicesRaw || !submittedValue) return;

    //This is removing the trailing comma from the available choice lists to do exact match with provided value
    var allowedValues = choicesRaw.split('\n')
        .map(function(line) {
            return line.trim().replace(/,+$/, '');
        })
        .filter(function(line) {
            return line.length > 0;
        });

    if (allowedValues.indexOf(submittedValue) === -1) {
        gs.addErrorMessage(
            gs.getMessage('Property update failed! "{0}" is not a valid choice. Select the value from the available choice list only!', submittedValue)
        );
        current.setAbortAction(true);
    }

})(current, previous);
