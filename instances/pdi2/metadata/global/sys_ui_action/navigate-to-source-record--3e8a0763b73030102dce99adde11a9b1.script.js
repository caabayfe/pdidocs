var sourceClassGR = new GlideRecord(current.source_class);
if (sourceClassGR.get(current.source_sys_id)) {
	action.openGlideRecord(sourceClassGR);
} else {
	var infoMessage = gs.getMessage("The source record with sys_id '{0}' in table '{1}' could not be found.", [current.source_sys_id, current.source_class]);
	gs.addInfoMessage(infoMessage);
}
