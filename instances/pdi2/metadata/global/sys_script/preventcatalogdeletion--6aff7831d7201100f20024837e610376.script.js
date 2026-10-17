gs.addErrorMessage(gs.getMessage('You cannot delete catalog [{0}] because it contains items and/or categories, or it is the only catalog.', current.getDisplayValue()));
current.setAbortAction(true);
