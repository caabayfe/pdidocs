//
//Allow change of state to pending_push only if all three conditions are met.
//1. payload is not empty.
//2. payload size is less than the max size allowed.
//3. payload is valid.
//
var isValid = isPayloadValid(current.version.payload);
if(!isValid) {
	gs.addInfoMessage(gs.getMessage("The local change(s) cannot be pushed because of invalid payload"),"local_change");
	current.setAbortAction(true);
}

function isPayloadValid(payload) {
	if(payload.nil())
		return false;

	if(payload.length <= 0)
		return false;

	if(payload == "The payload is larger than the allowed size")
		return false;

	var doc = GlideXMLUtil.parse(payload);
	if(!doc)
		return false;

	return true;
}
