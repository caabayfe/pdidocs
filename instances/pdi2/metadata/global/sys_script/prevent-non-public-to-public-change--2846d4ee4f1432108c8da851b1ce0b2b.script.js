(function executeRule(current, previous /*null when async*/ ) {
   gs.addErrorMessage(gs.getMessage("Cannot change a non-public playbook to public."));
   current.setAbortAction(true);
})(current, previous);
