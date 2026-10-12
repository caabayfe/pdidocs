(function executeRule(current, previous /*null when async*/) {
	SNC.PAMLBConversion.realTimeConversionForBreakdowns([current.getValue("breakdown")]);
})(current, previous);
