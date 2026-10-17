
            
            (function executeRule(current, previous /*null when async*/ ) {
                if (current.operation() == "update") {
                    gs.addErrorMessage(gs.getMessage('Cannot update mms service account user.'));
                    current.setAbortAction(true);
                } else { // operation is delete
                    gs.addErrorMessage(gs.getMessage('Cannot delete mms service account user.'));
                    current.setAbortAction(true);
                }
            })(current, previous);
