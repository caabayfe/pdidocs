(function executeRule(current, previous /*null when async*/ ) {
    // start end conditions must belong to the same finding def as constraint
    try {
        var constraintType = current.getValue("relation_constraint");
        if (current.source_condition.finding_def != current.finding_def) {
            throw gs.getMessage("The start condition must belong to the same finding definition as the constraint");
        } else if (current.getValue("criteria") == "NODE_TO_NODE" &&
            current.sink_condition.finding_def != current.finding_def) {
            throw gs.getMessage("The end condition must belong to the same finding definition as the constraint");
        } else {
            if ((constraintType == "DURATION" || constraintType == "TIME" || constraintType == "TOUCH_POINT") &&
                gs.nil(current.getValue("min")) && gs.nil(current.getValue("max"))) {
                throw gs.getMessage("Finding Constraint is empty. Please provide either min or max values");
            }
            if (constraintType == "SAME_EVENT" || constraintType == "DIFFERENT_EVENT") {
                var sourceConditionField = current.source_condition.field;
                var sinkConditionField = current.sink_condition.field;
                if (gs.nil(sourceConditionField) || gs.nil(sinkConditionField)) {
                    throw gs.getMessage("Either start or end condition is not based on a valid field");
                }
                if (sourceConditionField != sinkConditionField) {
                    throw gs.getMessage("Same/Different Event type constraint is based on conditions with different fields");
                }
                current.setValue("relation_constraint_field", sourceConditionField);
            }

            var ruleMatchError = '';

            var grSourceFindingRule = new GlideRecord('promin_finding_def_rule');
            grSourceFindingRule.addQuery('finding_def', current.finding_def);
            grSourceFindingRule.addQuery('source_condition', current.source_condition);
            grSourceFindingRule.query();
            var sourceCount = grSourceFindingRule.getRowCount();

            var sinkCount = 0;
            if (!gs.nil(current.sink_condition)) {
                var grSinkFindingRule = new GlideRecord('promin_finding_def_rule');
                grSinkFindingRule.addQuery('finding_def', current.finding_def);
                grSinkFindingRule.addQuery('sink_condition', current.sink_condition);
                grSinkFindingRule.query();
                sinkCount = grSinkFindingRule.getRowCount();
            }

            var findingDefLink = '<a href="' + current.finding_def.getRefRecord().getLink() + '" target="_blank">constraint\'s finding defintion </a>';
            // Multiple finding rules found using same conditions
            if (sourceCount > 1) {
                ruleMatchError += gs.getMessage("The start condition is being used in multiple rules belonging to the {0}.", findingDefLink);
            }
            if (sinkCount > 1) {
                ruleMatchError += gs.getMessage("The end condition is being used in multiple rules belonging to the {0}. ", findingDefLink);
            }

            if (ruleMatchError) {
                throw ruleMatchError;
            }

            if (sourceCount == 1 && sinkCount == 1) {
                grSourceFindingRule.next();
                grSinkFindingRule.next();

                if (grSourceFindingRule.chain != grSinkFindingRule.chain) {
                    throw gs.getMessage("A constraint can be added to the conditions that are used in the same chain of rules within the {0}. ", findingDefLink);
                }
                if (grSourceFindingRule.sequence > grSinkFindingRule.sequence) {
                    throw gs.getMessage("A constraint can be added to the conditions in the same sequence as mentioned in the rules within the {0}. ", findingDefLink);
                }
            }
            //Single step criteria
            if (current.getValue("criteria") == "NODE") {
                if (constraintType != "DURATION" && constraintType != "USER" && constraintType != "TIME" &&
                    constraintType != "TOUCH_POINT" && constraintType != "NOT_USER") {
                    throw gs.getMessage("Constraint type is not valid for single step criteria. ", findingDefLink);
                }
            } else if (current.getValue("criteria") == "NODE_TO_NODE") {
                if (constraintType == "USER" || constraintType == "NOT_USER" || constraintType == "TIME") {
                    throw gs.getMessage("Constraint type is not valid for cross step criteria. ", findingDefLink);
                }
            }
        }
        //Only save relevant values for constraints
        if (constraintType == "DURATION" || constraintType == "TIME" || constraintType == "TOUCH_POINT") {
            current.setValue("relation_constraint_field", "");
            current.setValue("value", "");
        } else if (constraintType == "USER" || constraintType == "NOT_USER") {
            current.setValue("relation_constraint_field", "");
            current.setValue("min", "");
            current.setValue("max", "");
        } else {
            current.setValue("value", "");
            current.setValue("min", "");
            current.setValue("max", "");
        }
    } catch (error) {
        gs.addErrorMessage(error);
        current.setAbortAction(true);
        action.setRedirectURL(current);
    }

})(current, previous);
