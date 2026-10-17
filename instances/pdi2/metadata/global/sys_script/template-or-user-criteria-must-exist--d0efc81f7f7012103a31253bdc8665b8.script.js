
            
            (function executeRule(current, previous /*null when async*/ ) {

                // In this particular use case we want to ensure that the user_criteria exists and template exists.

                if (current.user_criteria) {
                    if (!current.user_criteria.getRefRecord()?.isValidRecord()){
                        current.setAbortAction(true);
                        gs.addErrorMessage(gs.getMessage("Provided user criteria is not a valid record."));
                    }
                } else if (current.template) {
                    if (!current.template.getRefRecord()?.isValidRecord()){
                        current.setAbortAction(true);
                        gs.addErrorMessage(gs.getMessage("Provided application template is not a valid record."));
                    }
                }

            })(current, previous);
