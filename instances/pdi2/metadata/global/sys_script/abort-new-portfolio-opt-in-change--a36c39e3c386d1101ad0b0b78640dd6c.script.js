(function executeRule(current, previous /*null when async*/ ) {
    if (current.name == "standard_portfolio_construct.turn_on" && current.value == "false" && previous.value == "true") {
        gs.addErrorMessage(gs.getMessage("WARNING: Once you opt in to the new portfolio structure, you cannot revert back to the old portfolio structure"));
        current.setAbortAction(true);
        return;
    }
})(current, previous);
