var AesNotifyAdminOfDeploymentRequest = Class.create();
AesNotifyAdminOfDeploymentRequest.prototype = {
    initialize: function(emailProps) {
		if (emailProps ) {
			this.appName = emailProps.appName || '';
			this.requestorName = emailProps.requestorName || '';
			this.deploymentRequestUrl = emailProps.deploymentRequestUrl || '';
			this.taskNumber = emailProps.taskNumber || '';
		}
    },
	getBody: function() {
		var aesEmailScript = new AesEmailScript();
        var style = aesEmailScript.getStyles();
		var headerMessage = gs.getMessage('Review "{0}" for deployment', this.appName);
		var innerBody = '';

		innerBody += '<div>' + gs.getMessage('{0} submitted an app for you to review. To review the deployment request, see ', this.requestorName);
			innerBody += '<a style="' + style.link + '" href="' + this.deploymentRequestUrl + '">' + this.taskNumber + '</a>';
		innerBody += '</div>';

		return aesEmailScript.getBody('Administrator', headerMessage, innerBody, '');
	},
    type: 'AesNotifyAdminOfDeploymentRequest'
};
