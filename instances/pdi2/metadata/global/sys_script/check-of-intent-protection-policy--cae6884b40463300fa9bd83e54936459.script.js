
        
            (function executeRule(current, previous /*null when async*/) { 
                gs.addErrorMessage(gs.getMessage('Invalid insert. This NLU intent is read only.'));
                current.setAbortAction(true); 
            })(current, previous);
