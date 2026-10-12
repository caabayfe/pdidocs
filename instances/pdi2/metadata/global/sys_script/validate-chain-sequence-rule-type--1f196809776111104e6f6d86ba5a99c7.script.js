(function executeRule(current, previous /*null when async*/ ) {

    try {
		validateEmptyStartEndConditions();
		validateEmptyFindingDef();
        validateStartAndEndRuleType();
    } catch (error) {
        gs.addErrorMessage(error);
        current.setAbortAction(true);
        action.setRedirectURL(current);
    }
	
	function validateEmptyStartEndConditions() {
		if (!current.source_condition) {
            throw gs.getMessage("Missing start condition");
        }
        if (!current.sink_condition) {
            throw gs.getMessage("Missing end condition");
        }		
	}
	
	function validateEmptyFindingDef() {
		if (!current.source_condition.finding_def) {
            throw gs.getMessage("Missing finding defintion in start condition");
        }
        if (!current.sink_condition.finding_def) {
            throw gs.getMessage("Missing finding defintion in end condition");
        }
	}
	
    function validateStartAndEndRuleType() {
        if (current.source_condition.type == "CONTEXT") {
            throw gs.getMessage("Start condition cannot be a contextual field/value condition");
        }
        if (current.sink_condition.type == "CONTEXT") {
            throw gs.getMessage("End condition cannot be a contextual field/value condition");
        }
    }

})(current, previous);
