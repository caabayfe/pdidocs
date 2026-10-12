function onBefore(current, previous) {
	if (current.service_id.nil())
		current.service_id = generateServiceId(current.name);
	else
		current.service_id = generateServiceId(current.service_id);
}

function generateServiceId(value) {
	return new ScriptedRESTCommon().normalizeServiceId(value);
}
