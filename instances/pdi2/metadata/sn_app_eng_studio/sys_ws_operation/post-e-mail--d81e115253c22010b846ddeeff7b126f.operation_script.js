(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	if (
		!request.body ||
		!request.body.data.to ||
		!request.body.data.subject
	) {
		throw new sn_ws_err.ServiceError()
			.setStatus(400)
			.setMessage(gs.getMessageLang('Missing "to" or "subject" parameter ', 'en'))
			.setDetail(gs.getMessage('Missing "to" or "subject" parameter '));
	}

    /*
	 * Required params are ah_to and ah_subject. Oddly enough, the body is not required.
	 * See send_email Action in Flow Designer - /$flow-designer.do?sysparm_nostack=true#/action-designer/98c181d20b100300d97d8bf637673ab5/var/input
	 */
	var requestBodyData = request.body.data;

	/* 
	 * Allow the user who calls the API to pass an object or string.
	 * The contents of the body will de dependent on the script include that returns the content of the body
	 * Example of object:
	 * body: {
     *   appName: "Procurement App",
     *   requestorName: "Jane Developer",
     *   deploymentRequestUrl: "http://servicenow-instance.com",
     *   taskNumber: "abd12"
     * }
	 */
	var body = requestBodyData.body;
	var emailTemplate = requestBodyData.emailTemplate;
	var emailBody;

	if (emailTemplate) {
		/*
		 * We can probably use a better way of supporting various e-mail scripts. I don't
		 * want to over engineer this right now, there may be a better way of solving
		 * cross instance e-mails.
		 */
		if (emailTemplate === 'AesNotifyAdminOfDeploymentRequest') {
			var aesNotifyAdminOfDeploymentRequest = new AesNotifyAdminOfDeploymentRequest({
				appName: body.appName,
				requestorName: body.requestorName,
				deploymentRequestUrl: body.deploymentRequestUrl,
				taskNumber: body.taskNumber,
			});

			emailBody = aesNotifyAdminOfDeploymentRequest.getBody();

			if (emailBody === null || emailBody === undefined) {
				throw new sn_ws_err.ServiceError()
					.setStatus(400)
					.setMessage(gs.getMessageLang('Unable to retrieve e-mail body for template {0}.', "en", [emailTemplate]))
					.setDetail(gs.getMessage('Unable to retrieve e-mail body for template {0}.', [emailTemplate]));				
			}
		}
	} else {
		/*
		 * The send_email Action does not require a body. Defaulting to empty string if none
		 * is provided by the implementer.
		 */
		emailBody = body || '';
	}

	var emailInputs = {
		ah_to: requestBodyData.to,
		ah_subject: requestBodyData.subject,
		// send_email is expecting ah_body to be HTML, but sending a string sans HTML elements seems to work
		ah_body: emailBody,
	};

	try {
		sn_fd.FlowAPI.executeAction('global.send_email', emailInputs);		
	} catch(e) {
		throw new sn_ws_err.ServiceError()
			.setStatus(500)
			.setMessage(gs.getMessageLang('Unable to send e-mail from /generic/send_email endpoint.', 'en'))
			.setDetail(gs.getMessage('Unable to send e-mail from /generic/send_email endpoint.'));
	}

})(request, response);
