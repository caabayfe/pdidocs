var msg = policyActionConflicts();
if (msg != "")
   gs.addErrorMessage(gs.getMessage("There are multiple UI Policies with the same Order for this field - their run order is not predictable") + ": " + msg);
