(function executeRule(current, previous /*null when async*/ ) {
    var roleMissing = gs.nil(current.roles);

    var conditionMode = current.condition_mode;
    var conditionMissing = conditionMode.equalsIgnoreCase('advanced') ? gs.nil(current.condition_script) : gs.nil(current.condition);

    if (roleMissing && conditionMissing) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Skill applicability should have atleast a role or condition specified'));
    }

})(current, previous);
