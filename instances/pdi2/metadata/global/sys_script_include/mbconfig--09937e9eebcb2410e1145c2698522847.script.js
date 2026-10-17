var MBConfig = Class.create();
MBConfig.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	updateAuthentication: function() {
		
	var gr = new GlideRecord('sys_service_authentication');
	gr.initialize();
	gr.setValue('type', 'basic_auth');
	gr.setValue('key', this.getParameter('sysparm_key'));
	gr.setDisplayValue('secret', this.getParameter('sysparm_secret')); 
	var authSysId = gr.insert();
	return authSysId; 
		
	},
    type: 'MBConfig'
	
	
});
