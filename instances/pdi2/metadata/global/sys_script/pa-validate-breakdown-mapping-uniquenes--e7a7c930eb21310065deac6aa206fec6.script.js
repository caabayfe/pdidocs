function onBefore(current, previous) {
  if (new PAUtils().hasBreakdownMapping(current.sys_id, current.breakdown, current.facts_table)) {
	gs.addErrorMessage(gs.getMessage("There is already a mapping for this Facts table"));
	current.setAbortAction(true);
  }
}
