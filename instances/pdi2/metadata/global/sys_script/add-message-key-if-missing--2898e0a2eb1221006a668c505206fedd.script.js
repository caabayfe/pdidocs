addMessageKey();
function addMessageKey(){
	current.message_key = current.source + "_" + current.node + "_" + current.type.name + "_" + current.resource;
}
