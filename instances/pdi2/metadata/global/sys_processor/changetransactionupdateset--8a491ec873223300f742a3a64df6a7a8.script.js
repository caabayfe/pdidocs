switchTransactionUpdateSet();

function switchTransactionUpdateSet() {
	var SYSPARM_TRANSACTION_UPDATE_SET = "sysparm_transaction_update_set";
	var SYSPARM_RECORD_UPDATE_SET = "sysparm_record_update_set";
	var COLLISION_AVOIDANCE_UPDATE_SET_SWITCHED = "collision.updateset.switched";
	var COLLISION_AVOIDANCE_UPDATE_SET_SWITCHED_NAME = "Updateset switched from Collision";
	var COLLISION_AVOIDANCE_UPDATE_SET_NOT_SWITCHED = "collision.updateset.not_switched";
	var COLLISION_AVOIDANCE_UPDATE_SET_NOT_SWITCHED_NAME = "Record's Updateset from Collision";
	var refreshNav = g_request.getParameter('refresh_nav');
	if (refreshNav == 'true')
		SncAppsUtil.flushNavigator();

	var referrer = g_request.getParameter('referrer');
	if (!referrer)
		referrer = g_request.getHeader('referer');

	// make sure it's a relative URL or in-instance URL
	referrer = getSafeURL(referrer);
	var referralUrl = new GlideURL(referrer);
	var returnURL = g_request.getParameter('self_return');
	if (returnURL)
		referralUrl.set('sysparm_goto_url', referrer);

	var transactionUpdateSet = g_request.getParameter(SYSPARM_TRANSACTION_UPDATE_SET);
	var recordUpdateSet = g_request.getParameter(SYSPARM_RECORD_UPDATE_SET);
	if (transactionUpdateSet) {
		referralUrl.set(SYSPARM_TRANSACTION_UPDATE_SET, transactionUpdateSet);
		referralUrl.set('sysparm_nostack', 'true');
		/* Post Usage Analytics event if transactionUpdateSetId is set and it's different from recordUpdateSetId
		 * i.e. User has switched the update set from record's update set to user's current update set.
		 * Post another event if transactionUpdateSetId is same as recordUpdateSetId i.e. record update set is used
		 */
		if (transactionUpdateSet != recordUpdateSet)
			postUAEvent(COLLISION_AVOIDANCE_UPDATE_SET_SWITCHED, COLLISION_AVOIDANCE_UPDATE_SET_SWITCHED_NAME);     //DEFN1002117
		else
			postUAEvent(COLLISION_AVOIDANCE_UPDATE_SET_NOT_SWITCHED, COLLISION_AVOIDANCE_UPDATE_SET_NOT_SWITCHED_NAME);     //DEFN1002122
	}

	referralUrl.set('sysparm_clear_stack', null);

	g_response.sendRedirect(referralUrl.toString());
}

function getSafeURL(url) {
	/*
    This regular expression breaks up the incoming value to several groups.
    Knowing which groups do what, allows us to handle incoming referer.
    Example for https://nowexample.service-now.com/incident.do?sysparm_filter_only=true
    Match[0] = https://nowexample.service-now.com/incident.do?sysparm_filter_only=true
    Match[1] = https:
    Match[2] = nowexample.service-now.com
    Match[3] = /incident.do
    Match[4] = ?sysparm_filter_only=true
    */
    if (JSUtil.nil(url))
        return null;

    url = removeDoubleSlash(url);
    var match = ("" + url).match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);

    //Make sure there is something to check.
    if (JSUtil.nil(match) || !validateMatch(match[3]))
        return null;

    //Might have a protocol (http/https)
    if (validateMatch(match[1])) {
        if (match[1] != "https:" && match[1] != "http:")
            return null;

       return (validateMatch(match[2]) && isWhitelistedDomain(match[0])) ? url : null;
    }


    //Some referrers start with $. Fix it.
    if(match[3].startsWith('$'))
        match[3] = '/' + match[3];

    //Don't have a fully qualified domain. https://example.com/sys_something.do
    //Might have example.com/sys_something.do OR /sys_something.do
    if (match[3].startsWith('/')) {
        var hostHeader = g_request.getHeader("host");
	var path = (validateMatch(match[4])) ? match[3] + match[4] : match[3];
	//Tests can have issues if the glide servlet URI is picking up a different IP.
        if (isWhitelistedDomain(hostHeader)) {
		var proto = gs.getProperty("glide.servlet.protocol");

		return JSUtil.notNil(proto) ? proto + "://" + hostHeader + path : "https://" + hostHeader + path;
        }

        //URL should have a local directory but no hostname. URL should be local.
        return removeDoubleSlash(gs.getProperty('glide.servlet.uri') + path.substring(1));
    }

    var uSplit = match[3].split("/");
    if (isWhitelistedDomain(uSplit[0]))
        return url;

    return null;
}

function isWhitelistedDomain(url) {
   var domains = gs.getProperty('glide.change_current_app.whitelist', '');
   var domainArray = domains.split(',');

   //strip protocol
   if (isUrlSchemeHTTP(url))
       url = url.substr(7);
   else if (isUrlSchemeHTTPS(url))
       url = url.substr(8);

    //Assume the local uri is a valid Domain
    //We remove DoubleSlashes because testing showed things like localhost:8080//
    if (url.startsWith(removeDoubleSlash(gs.getProperty("glide.servlet.uri"))))
        return true;

   for (var i = 0; i < domainArray.length; i++) {
       var whitelistedDomain = domainArray[i].trim();
           //handles the case where you're redirecting to just localhost:8080 or vanity.domain
           //in addition to a url like localhost:8080/some_page.do or vanity.domain/home.do
       if (url.startsWith(whitelistedDomain + '/') || url == whitelistedDomain)
           return true;
   }

	//We have to handle IPAddresses in addition to hostnames. ipList is an arrayList.
	var ipList = GlideHostUtil.getNonLoopbackIPs(true);
	for (var j = 0; j < ipList.size(); j++) {
		//IPV6 addresses can appear like fc00:0:0:0:0:0:6440:1%utun3 need only the address not interface.
		var currentIP = (ipList.get(j).includes("%")) ? ipList.get(j).trim().split("%"): ipList.get(j).trim();

		if(url.startsWith(currentIP))
			return true;
	}

   return false;
}

function validateMatch(match) {
    return (JSUtil.notNil(match) && typeof match === 'string' && match.length > 0);
}

function removeDoubleSlash(url) {
    //Get rid of "//" can cause issues with redirects.
    return ("" + url).replace(/(^|[^:])\/{2,}/g, "$1/");
}

function isUrlSchemeHTTP(url) {
	return url.startsWith('http://');
}

function isUrlSchemeHTTPS(url) {
	return url.startsWith('https://');
}

function postUAEvent(eventId, eventName) {
	var PLUGIN_ID = "com.snc.createnow.*";
	try {
		sn_ua.GlideUAEvent.postEvent(eventId, PLUGIN_ID, eventName);
	} catch (e) {
		gs.error("Error sending UA event: " + eventId , e);
	}
}
