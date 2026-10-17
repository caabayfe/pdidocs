(function executeRule(current, previous /*null when async*/) {
	if (!current.name)
		current.name = new global.VizDesignerUtil().getNameFromProperties(current.macroponent, current.properties);

})(current, previous);
