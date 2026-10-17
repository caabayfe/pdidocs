switchCurrentApp();

function switchCurrentApp() {
	var appId = g_request.getParameter('app_id');
	if(appId)
		gs.setCurrentApplicationId(appId);
	
	var refreshNav = g_request.getParameter('refresh_nav');
	if(refreshNav == 'true')
		SncAppsUtil.flushNavigator();
	
	var referrer = g_request.getParameter('referrer');
	if (!referrer)
		referrer = g_request.getHeader('referer');

	//now make sure it's a relative URL, or it's an in-instance URL
	referrer = getSafeURL(referrer);
	var referralUrl = new GlideURL(referrer);
	var returnURL = g_request.getParameter('self_return');
	if (returnURL)
		referralUrl.set('sysparm_goto_url', referrer);

	var recordScope = g_request.getParameter('sysparm_record_scope');
	if(recordScope) {
		referralUrl.set('sysparm_record_scope', recordScope);
		referralUrl.set('sysparm_nostack', 'true');
	}

	if(appId)
		referralUrl.set('sysparm_record_scope', null);

	referralUrl.set('sysparm_clear_stack', null);

	var returnRedirectUrl = g_request.getParameter('sysparm_return_redirect_url');
    if (j2js(returnRedirectUrl) === 'true')
        g_processor.writeOutput(referralUrl.toString());
    else
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
	
    //Don't have a fully qualified domain. https://example.com/sys_something.do
    //Might have example.com/sys_something.do OR /sys_something.do
    if (match[3].startsWith('/') || match[3].startsWith('$')) {
        var baseUrl = GlideTransaction.get().getBaseURL();
		var path = (validateMatch(match[4])) ? match[3] + match[4] : match[3];

	return baseUrl + (path.startsWith('/') ? path.substring(1): path);
    }

    var uSplit = match[3].split("/");
    if (isWhitelistedDomain(uSplit[0]))
        return url;
    return null;
}
function isWhitelistedDomain(url) {
   var domains = gs.getProperty('glide.change_current_app.whitelist', '');
   var domainArray = domains.split(',');

	//Assume the local uri is a valid Domain
    //We remove DoubleSlashes because testing showed things like localhost:8080//
    if (url.startsWith(removeDoubleSlash(gs.getProperty("glide.servlet.uri"))))
        return true;
   //strip protocol
   if (url.startsWith('http://'))
       url = url.substr(7);
   else if (url.startsWith('https://'))
       url = url.substr(8);

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
    return ("" + url).replace(/(^|[^:])\/{2,}/g, '$1/');
}
