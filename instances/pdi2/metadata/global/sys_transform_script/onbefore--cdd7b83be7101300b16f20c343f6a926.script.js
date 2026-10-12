(function runTransformScript(source, map, log, target /*undefined onStart*/ ) {
	var oidcTransformCheck = new OIDCTransformCheck(source, map, log, target);
	var isMappingValid = oidcTransformCheck.validateMappingOnBefore();
	if(!isMappingValid) {
		ignore = true;
	}
})(source, map, log, target);
