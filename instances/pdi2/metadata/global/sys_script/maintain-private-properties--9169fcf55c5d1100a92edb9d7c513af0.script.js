// If for some reason someone creates or updates the instance properties, mark them private so they don't move around between instances.

function isInstancePropertyPrivate(name) {
	var protectedNames = [ "instance_id", "instance_name", "glide.war", "glide.war.assigned","glide.builddate","glide.builddate.last","glide.buildtag","glide.buildtag.last","mid.version","glide.update.find_customer_update","glide.security.ccsi.find.cust_modified",
	"glide.apps.hub.current", "glide.sm.default_mode", "glide.ts.version", "glide.ts.tokenizer"];
	if(!name)
		return false;
	
	for (var i = 0; i < protectedNames.length; i++) {
		if(name == protectedNames[i]) {
			return true;
		}
	}
	
	return false;
}

if(isInstancePropertyPrivate(current.name))
	current.is_private = true;
