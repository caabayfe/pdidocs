if (SNC.PAScript.isScriptReferencedByIndicatorsOrBrakdowns(current.sys_id)) {
	gs.addErrorMessage(gs.getMessage("Facts table cannot be changed because there is at least one Breakdown or Indicator depending on this Script"));
	current.setAbortAction(true);
}
