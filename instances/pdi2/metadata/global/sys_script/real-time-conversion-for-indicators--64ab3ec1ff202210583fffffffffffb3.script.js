(function executeRule(current, previous /*null when async*/) {
	SNC.PAMLBConversion.realTimeConversionForIndicators([current.getValue("indicator")]);
})(current, previous);
