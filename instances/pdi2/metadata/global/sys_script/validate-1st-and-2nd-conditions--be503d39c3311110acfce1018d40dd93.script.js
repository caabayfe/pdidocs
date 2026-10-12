(function executeRule(current, previous /*null when async*/ ) {
    try {
        if (current.left.finding_def != current.finding_def || current.right.finding_def != current.finding_def) {
            throw gs.getMessage("The first and second conditions must belong to the same finding definition as the condition.");
        }

        if (current.left.table != current.table || current.right.table != current.table) {
            throw gs.getMessage("The first and second conditions must belong to the same table as the condition.");
        }

        var topLevelConditions = [];
        var grRule = new GlideRecord("promin_finding_def_rule");
        grRule.addQuery('finding_def', current.finding_def);
        grRule.query();
        while (grRule.next()) {
            topLevelConditions.push(grRule.source_condition.toString());
            topLevelConditions.push(grRule.sink_condition.toString());
        }
        var findingDefLink = '<a href="' + current.finding_def.getRefRecord().getLink() + '" target="_blank">condition\'s finding defintion </a>';
        if (topLevelConditions && topLevelConditions.indexOf(current.left.toString()) > -1) {
            throw gs.getMessage("The first condition is being reused in other rule within the {0}. Please create a new condition for the same.", findingDefLink);
        }
        if (topLevelConditions && topLevelConditions.indexOf(current.right.toString()) > -1) {

            throw gs.getMessage("The second condition is being reused in other rule within the {0}. Please create a new condition for the same.", findingDefLink);
        }
    } catch (error) {
        gs.addErrorMessage(error);
        current.setAbortAction(true);
        action.setRedirectURL(current);
    }

})(current, previous);
