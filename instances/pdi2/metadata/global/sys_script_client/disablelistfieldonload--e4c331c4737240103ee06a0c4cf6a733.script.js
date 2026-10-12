function onLoad() {
   //Type appropriate comment here, and begin script below
	function getParmVal(name) {
		var uri = top.location.href.parseQuery()['uri'];
		var url = uri ? uri.parseQuery() : top.location.href.parseQuery();
		if (url[name])
			return url[name];
		else
            		return;
    	}
	
	var isRelatedList = getParmVal('sysparm_record_list') || getParmVal('sys_is_related_list');
	if (isRelatedList)
		g_form.setReadOnly('list', true);
}
