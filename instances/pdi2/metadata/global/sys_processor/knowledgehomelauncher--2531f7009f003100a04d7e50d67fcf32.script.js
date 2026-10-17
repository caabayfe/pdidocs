var params = g_request.getParameterNames();
var v3page = '$knowledge.do';
var pageParam = '';
var portalName = gs.getProperty('sn_km_portal.glide.knowman.serviceportal.portal_url', 'kb') || "kb";
var portalHomePage = "/"+portalName+"?id=kb_home";
var portalSearchPage = "/"+portalName+"?id=kb_search";
var openPortal = (!GlidePluginManager.isActive("com.snc.knowledge3")) || gs.getProperty("sn_km_portal.glide.knowman.serviceportal.enable_redirect","false")=="true";
var url='';
var searchParam = ["sysparm_type_filter","sysparm_category_ids","sysparm_kb_ids","sysparm_order","sysparm_kb","sysparm_category","kb_knowledge_base","language",
"query","spa","author","kb_category","rating","modified","view_count"];
while (params.hasMoreElements()) {
	var param = params.nextElement();
	var paramVal = g_request.getParameter(param);
	var paramName = param+ "";
	var skippable = paramName == "sysparm_device" || paramName == "browse_type";
	if(paramVal && (!openPortal || !skippable) && searchParam.includes(paramName)) {
		if(pageParam === '')
			pageParam = param + '=' + paramVal;
		else
			pageParam = pageParam + '&' + param + '=' + paramVal;
	}
}
if(openPortal){
	if(pageParam.length != 0)
		url = portalSearchPage+ '&' + encodeURI(pageParam);
	else
		url = portalHomePage;
}
else url = v3page + '?' + encodeURI(pageParam);
g_response.sendRedirect(url);
