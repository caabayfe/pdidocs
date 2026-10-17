function generateDescription() {
	return gs.getMessage("Send a '{0}' request to '{1}'", [step.inputs.http_method.toUpperCase(), step.inputs.end_point]);
}
 generateDescription();
