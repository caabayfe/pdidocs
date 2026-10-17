function transform() {	
	var active = GlidePluginManager.isActive('com.sn_pa_domain_filter');
	var domain = [];
	if(active == true) {		
		var gq = new GlideRecord("domain");
		gq.addQuery("active", true);
		gq.query();
		count = 0;
		while(gq.next()){
			domain[count] = '{"' + gq.sys_id + '":"' + gq.parent + '"}';
			count++;
		}
	}
	var details = {
		active: active,
		domain: domain
	};	
	return details;
}
