/*
*  The whole IP Service Affinity is the idea that when a device has more than 1 port open for Discovery, we will record which service (port)
*  Discovery ended up exploring with. This is to solve the problem say a network device has both ssh (22) and snmp (161) open. Based on
*  The concept of classification priority, we would normally explore ssh first then snmp. What happens is Discovery cannot talk to ssh, so 
*  it ends up classifying using snmp. We should record this affinity so that in the subsequent Discovery, it will try snmp first.
*
*  @author aleck.lin@servicenow.com
*/

var IPServiceAffinity = Class.create();
IPServiceAffinity.prototype = {
    initialize: function(ip_address, port) {
		this.ip = ip_address;
		this.port = port;
		this.ipService = this._getIPService();
    },
	
	/*
	* Get the IP service port
	*/
	getServicePort: function() {
		if (JSUtil.nil(this.ip))
			return;
		
		var gr = new GlideRecord("ip_service_affinity");
		if (!gr.get("ip_address", this.ip))
			return ;
		
		this.ipService = gr.ip_service;
		this.port = gr.ip_service.port;
		
		return this.port;
	},
	
	
	/* 
	* Create or update the IP to Port Affinity for the IP address
	*/
	setIPServiceAffinity: function() {
		// do not save the affinity, if IP service affinity is disabled
		if (!JSUtil.toBoolean(gs.getProperty("glide.discovery.ip_service_affinity", "false")))
			return;
		
		var gr = new GlideRecord("ip_service_affinity");
		if (gr.get("ip_address", this.ip)) {
			gr.setValue("ip_service", this.ipService.sys_id);
			gr.update();
		} else {
			gr.initialize();
			gr.setValue("ip_address", this.ip);
			gr.setValue("ip_service", this.ipService.sys_id);
			gr.insert();
		}		
	},	
	
	/******************************************
	* Private method
	******************************************/
	
	_getIPService: function() {
		if (JSUtil.nil(this.port))
			return;
		
		var gr = new GlideRecord("cmdb_ip_service");
		if (gr.get("port", this.port))
			return gr;
		
		return;
	},	
		
    type: 'IPServiceAffinity'
}
