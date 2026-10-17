var DockerWebhookCallbackURLGenerator = Class.create();
DockerWebhookCallbackURLGenerator.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	
	generateCallbackURL: function(registryGR) {
        var tokenID = this.getParameter('sysparm_token') || registryGR.getValue('token');
        var path = this.getParameter('sysparm_path') || registryGR.getValue('path');
        var registryID = this.getParameter('sysparm_id') || registryGR.getUniqueValue();
		
		var whRegistryGr = new GlideRecordSecure('sn_docker_spoke_docker_webhook_registry');
		whRegistryGr.addQuery('sys_id', registryID);
		whRegistryGr.addQuery('token', tokenID);
		whRegistryGr.query();

        var tokenVerification = new GlideRecordSecure('token_verification');
        if (!gs.nil(tokenID) && tokenVerification.get(tokenID) && whRegistryGr.hasNext()) {
            return gs.getProperty("glide.servlet.uri") + GlideStringUtil.escapeHTML(path) + "?" + "ni.nolog.id=" + registryID + "&" + "ni.nolog.token=" + encodeURIComponent(tokenVerification.getValue('token'));
        }
        return '';
    },
	
    type: 'DockerWebhookCallbackURLGenerator'
});
