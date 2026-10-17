(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.isFactTableRotation = SncTableRotationExtensions.isRotated(current.facts_table);

})(current, previous);
