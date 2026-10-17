/*
 * Given a comma-separated list of roles in 'roles', returns a comma-separated list (hopefully empty) of those that are necessary and missing, in the //result/missing tag.
 * Also returns the state of strict SOAP security in the //result/strict tag, and basic SOAP authentication in the //result/basicauth tag.
 */
var isStrict = GlideProperties.getBoolean('glide.soap.strict_security');
var isBasicAuth = GlideProperties.getBoolean('glide.basicauth.required.soap');
var roles = request.roles.split(',');
var missing = [];
if (isBasicAuth && isStrict) {
    for (var i = 0; i < roles.length; i++) {
        if (!gs.getUser().hasRole(roles[i]))
            missing.push(roles[i]);
    }
}
var resp = {'result':{}};
resp.result.missing = missing.join(',');
resp.result.strict = (isStrict ? 'true' : 'false');
resp.result.basicauth = (isBasicAuth ? 'true' : 'false');
response.response = new XMLHelper().toXMLDoc(resp);

// User Authorization successful?
if (missing.length != 0) {	
	// Generate the Event
	//   instance = null
	//   parm1    = userID
	//   parm2    = comma separated list of missing roles
	//
	
	// Trigger Event
	gs.eventQueue('login.authorization.failed', null, gs.getUserName(), resp.result.missing);	
}
