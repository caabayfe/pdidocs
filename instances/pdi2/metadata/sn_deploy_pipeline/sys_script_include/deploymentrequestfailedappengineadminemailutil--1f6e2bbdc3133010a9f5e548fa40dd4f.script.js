var DeploymentRequestFailedAppEngineAdminEmailUtil = Class.create();
DeploymentRequestFailedAppEngineAdminEmailUtil.prototype = {
    initialize: function() {},

    getSubject: function(deploymentRequestRecord) {
        var appName = deploymentRequestRecord.getDisplayValue("app_name");

        return gs.getMessage("Publish failed for {0}", appName);
    },

    getPublishFailedEmailBodyForAppEngineAdmin: function(deploymentRequestRecord) {
        var appName = deploymentRequestRecord.getDisplayValue("app_name");

        var appEngineEmailScript = new sn_app_eng_notify.AppEngineEmailScript();

        // heading
        var heading = gs.getMessage("Publishing failed for {0}", appName);
        appEngineEmailScript.addHeading(heading);

        // greeting
        var greeting = gs.getMessage("Hi,");
        appEngineEmailScript.addText(greeting, false);

        // message
        var message = gs.getMessage("Something went wrong with {0} during publish to app repo. The request to deploy this app has been closed.", appName);

        appEngineEmailScript.addText(message, true);
		
		var buttonText = gs.getMessage("Go to the request");
		appEngineEmailScript.addButton(buttonText, this.getDeploymentRequestURL(deploymentRequestRecord));

        return appEngineEmailScript.getBody();
    },

	/**
	 * Get Deployment request URL based on AEMC access 
	 */
	getDeploymentRequestURL: function(deploymentRequestRecord) {
		var isAEMCPluginActive = GlidePluginManager.isActive('com.sn_aemc');
		var sysId = deploymentRequestRecord.getDisplayValue('sys_id');

		var deploymentReqURL;
		if(isAEMCPluginActive)
			deploymentReqURL = '/now/aemc/record/sn_deploy_pipeline_deployment_request/'+sysId+'/';
		else
			deploymentReqURL = deploymentRequestRecord.getLink();

		return deploymentReqURL;
	},

    type: 'DeploymentRequestFailedAppEngineAdminEmailUtil'
};
