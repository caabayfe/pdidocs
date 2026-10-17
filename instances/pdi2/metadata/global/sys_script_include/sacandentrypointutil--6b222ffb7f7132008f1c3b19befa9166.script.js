var SaCandEntryPointUtil = Class.create();
SaCandEntryPointUtil.prototype = {
	initialize: function() {
	},
	
	handleRecordChanges: function (current){
		//first check if the record exists in sa_cand_entry_point
		var uGr = new GlideRecord('sa_cand_entry_point');
		uGr.addQuery('load_balancer_service', current.sys_id);
		uGr.query();
		if(uGr.next()){
			//record exists
			if(this.areAllKeyFieldsEmpty(current)) {//delete
				uGr.deleteRecord();				
			} else {//update
				this.setValues(uGr, current);				
				uGr.update();
			}
		} else if (!this.areAllKeyFieldsEmpty(current)){
			//the record does not exist and at least one key field has a value - insert
			var iGr = new GlideRecord('sa_cand_entry_point');
			iGr.initialize();
			this.setValues(iGr, current);
			iGr.insert();		
		}
	},
	
	setValues: function(wGr, current){		
		wGr.setValue('name', current.name);
		wGr.setValue('ip_address', current.ip_address);
		wGr.setValue('port', current.port);
		//set the host var to the value of the IP or the FQDN depending on which one of them is not empty
		var host = String(current.getValue('ip_address') || '');
		if(!host) {
			host = String(current.getValue('fqdn') || '');
		}	
		//if the host is not empty and the port is 80 or 443 , create url field; otherwise use the input url field
		if (host && current.port == '80')
			wGr.setValue('url', 'http://' + host + ':' + current.port);
		else if (host && current.port == '443')
			wGr.setValue('url', 'https://' + host + ':' + current.port);
		else
			wGr.setValue('url', current.input_url);
		
		wGr.setValue('source', 'Load Balancer');
		wGr.setValue('fqdn', current.fqdn);		
		var hit_count = (current.hit_count && !current.hit_count.nil()) ? current.hit_count : -1;
		wGr.setValue('hit_count', hit_count);
		wGr.setValue('load_balancer_service', current.sys_id);
		wGr.setValue('lb_service_install_status', current.install_status);		
		wGr.setValue('load_balancer', current.load_balancer);
		wGr.setValue('lb_operational_status', current.load_balancer.operational_status);
		wGr.setValue('sys_domain', current.sys_domain);
		wGr.setValue('sys_domain_path', current.sys_domain_path);		
	},
	
	areAllKeyFieldsEmpty: function (current) {
		if(!current.ip_address && !current.fqdn && !current.input_url) {			
			return true;
		}
		return false;
	},
	
	type: 'SaCandEntryPointUtil'
};
