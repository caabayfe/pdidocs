onLoad();

function onLoad() {
	var type = $('cred_type').value;
	if (type == 'aws')
		handleAws();
	else
		setDefaultMIDServer();
}

function setDefaultMIDServer() {
	if ($('sys_display.ecc_agent').value != "")
		return;
	
	var gr = new GlideRecord('ecc_agent');
	gr.addQuery("status", "Up");
	gr.query();
	if (gr.next()) {
		$('sys_display.ecc_agent').value = gr.name;
		$('ecc_agent').value = gr.sys_id;
	}
}

function handleCancel() {
	GlideDialogWindow.get().destroy();
}

function handleRetry() {
	$('test_failed').hide();
	$('test_successful').hide();
	$('test_form').show();
	$('test_form').focus();
}

function handleSuccess() {
	$('test_progress').hide();
	$('test_successful').show();
	$('test_successful').focus();
}

function handleError(error) {
	var msg = this.getErrorMessage(error);
	$('test_progress').hide();
	$('test_failed').show();
	$('test_failed').focus();
	$('err_text').innerHTML = msg;
}

function parseResult(ecc_sys_id) {
	var ga = new GlideAjax('CredentialTestAjax');
	ga.addParam('sysparm_name', 'parseCredentialTestResult');
	ga.addParam('sysparm_ecc_sys_id', ecc_sys_id);
	ga.getXMLWait();

	var result = ga.getAnswer();

	if (result === "success")
		handleSuccess();
	else
		handleError(result);
}

function checkProgress(ecc_sys_id, agent, timestamp, timeout) {
	if (gel("timestamp") === null || timestamp !== gel("timestamp").value)
		return;

	if (timeout <= 0) {
		handleError("Credential test timed out");
		return;
	}

	var ga = new GlideAjax('CredentialTestAjax');
	ga.addParam('sysparm_name', 'checkProgress');
	ga.addParam('sysparm_ecc_sys_id', ecc_sys_id);
	if (agent)
		ga.addParam('sysparm_agent', agent);
	ga.getXMLWait();
	var result = ga.getAnswer();

	if (result.substring(0, 5) == 'error') {
		handleError(result);
		return;
	}

	if (result.substring(0, 10) == 'processing') {
		setTimeout(function() { checkProgress(ecc_sys_id, agent, timestamp, timeout-1); }, 1000);
		return;
	}

	parseResult(result);
}

function validAgentAndTarget(agent, target, type) {

	if (agent === "") {
		notificationMessage("MID Server cannot be empty");
		return false; 
	}

	if (target === "") {
		notificationMessage("Target cannot be empty");
		return false;
	}

	var strictGa = new GlideAjax('IPAddressValidator');
	strictGa.addParam('sysparm_name', 'validateStrict');
	strictGa.addParam('ip_value', target);
	strictGa.getXMLWait();

	var isValidIP = strictGa.getAnswer();

	if (isValidIP == 'false') {
		//Allow URL input for VMware and JMS
		if (type == 'jms' || type == 'vmware') {
			try {
				new URL(target);
				return true;
			} catch(e) {
				notificationMessage("Please enter a valid URL or IP address");
				return false; 
			}
		} 
		
		notificationMessage("Invalid IP Address");
		return false;
	}

	return true;
}

function triggerCredentialTest() {
	var agent = $('sys_display.ecc_agent').value;
	var agent_sysId = $('ecc_agent').value;
	var type = $('cred_type').value;
	var target = $('target').value;
	var port = $('port') === null ? 0 : $('port').value;
	var credential_data = $('cred_data').value;

	if (!validAgentAndTarget(agent, target, type))
		return;

	var ga = new GlideAjax('CredentialTestAjax');
	ga.addParam('sysparm_credential_data', credential_data);
	ga.addParam('ni.nolog.sysparm_credential_data', 'true');
	ga.addParam('sysparm_target', target);
	ga.addParam('ni.nolog.sysparm_target', 'true');
	ga.addParam('sysparm_port', port);
	ga.addParam('sysparm_agent', agent);
	ga.addParam('sysparm_agent_sysId', agent_sysId);
	
	switch (type) {
		case 'jdbc':
			// Grab the selected option from the dropdown
			var db_type_e = gel("jdbc_db_type");
			var db_type = db_type_e.options[db_type_e.selectedIndex].value;
			var db_name = gel("db_name").value;
			ga.addParam('sysparm_name', 'testCredentialJdbc');
			ga.addParam('sysparm_db_type', db_type);
			ga.addParam('sysparm_db_name', db_name);
			break;
		case 'jms':
			var initial_context_factory = gel("initial_context_factory").value;
			ga.addParam('sysparm_name', 'testCredentialJms');
			ga.addParam('sysparm_initial_context_factory', initial_context_factory);
			break;
		default:
			ga.addParam('sysparm_name', 'testCredential');
			break;
	}

	ga.getXMLWait();
	var answer = ga.getAnswer();
    try {
        // First try to parse as JSON for our error format
        var response = JSON.parse(answer);
        if (response.status === 'error') {
            $('test_form').hide();
            $('test_failed').show();
            $('test_failed').focus();
            $('err_text').innerHTML = response.message;
            return;
        }

        // If not an error, proceed with test
        $('test_form').hide();
        $('test_progress').show();
        $('test_progress').focus();

        try {
            checkProgress(response.sys_id || answer, agent, gel('timestamp').value, 60);
        } catch (e) {
            handleError('Failed to test credentials: ' + e.message);
        }
    } catch (e) {
        // If not JSON, try legacy flow
        try {
            $('test_form').hide();
            $('test_progress').show();
            $('test_progress').focus();
            checkProgress(answer, agent, gel('timestamp').value, 60);
        } catch (e) {
            handleError('Failed to test credentials: ' + e.message);
        }
    }

}

// AWS has no form, all it needs is the credential id
// There is also no mid server agent involved
function handleAws() {
	$('test_form').hide();
	$('test_progress').show();
	$('test_progress').focus();
	
	var credential_id = $('sys_uniqueValue').value;
	var ga = new GlideAjax('CredentialTestAjax');
	ga.addParam('sysparm_name', 'testCredentialAws');
	ga.addParam('sysparm_credential_id', credential_id);
	ga.getXMLWait();
	
	var sys_id = ga.getAnswer();
	checkProgress(sys_id, null, gel("timestamp").value);
}

function actionOK() {
	triggerCredentialTest();
}

function getErrorMessage(result) {
	var idx = result.indexOf(':');
	return (idx < 0) ? result : result.substring(idx + 1);
}

function notificationMessage(msg) {
   var options = {};
   options.text = "<b style='color:red;'>" + msg + "</b>";
   options.fadeIn = 0;
   options.fadeOut = 500;
   options.closeDelay = 5000;
   options.sticky = false;
   options.type = "warn";

   new NotificationMessage(options);
}
