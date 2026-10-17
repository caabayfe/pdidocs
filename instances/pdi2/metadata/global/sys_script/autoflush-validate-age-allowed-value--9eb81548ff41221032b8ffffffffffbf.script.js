(function executeRule(current, previous) {

    var minAgeAllowed = 0;
    var maxAgeAllowed = 2147483647;
    var age = current.getValue('age'); //don't do current.age, it converts to Integer.MAX_VALUE if overflows
	
    if (isNaN(age) || age > maxAgeAllowed || age < minAgeAllowed) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("The age must be in range from {0} to {1}", [minAgeAllowed, maxAgeAllowed]));
    }

})(current, previous);
