onLoad();

function onLoad() {	
	if (!validateCreds())
		return;
	
	if (($('use_mid').value) == "true")
		setDefaultMIDServer();	
	else
		triggerConnectionTest();
}

function triggerConnectionTest(){
	$('test_form').hide();
	$('test_progress').show();
	var connectionDataString = $('connection_data').value;
	var connectionData  = JSON.parse(connectionDataString);
	
	var ga = new GlideAjax('ConnectionTestAjax');
	ga.addParam('sysparm_name', 'testConnectionJdbc');
	ga.addParam('sysparm_credential_id', connectionData.credential);
	ga.addParam('sysparm_db_driver', connectionData.format);
	ga.addParam('sysparm_url', connectionData.connection_url);		
	ga.getXMLAnswer(function(answer){
		processConnectionResult(answer);
    });
}

function processConnectionResult(result){	
	if (result == "success")
		handleSuccess();
	else
		handleError(result);	
}

function setDefaultMIDServer() {
	if ($('sys_display.ecc_agent').value != "")
		return;
	
	var gr = new GlideRecord('ecc_agent');
	gr.addQuery("status", "Up");
	gr.query();
	if (gr.next())
		midName = gr.name;
		
	$('sys_display.ecc_agent').value = midName;
}

function handleCancel() {
	GlideDialogWindow.get().destroy();
}

function handleSuccess() {
	$('test_progress').hide();
	$('test_successful').show();
}

function handleError(error) {
	var msg = this.getErrorMessage(error);
	$('test_progress').hide();
	$('test_failed').show();
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
		handleError("Connection test timed out");
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

function validAgentAndTarget(agent, target) {
	var valid = true;

	if (agent === "") {
		notificationMessage("MID Server cannot be empty");
		valid = false;
	}

	if (target === "") {
		notificationMessage("Target cannot be empty");
		valid = false;
	}

	return valid;
}

function triggerConnectionTestUseMid() {
	var agent = $('sys_display.ecc_agent').value;

	var connectionDataString = $('connection_data').value;
	var connectionData  = JSON.parse(connectionDataString);
	var target = connectionData.host;
	var port = connectionData.port;
	var connectionURL = connectionData.connection_url;
	var jdbcDriver = connectionData.jdbc_driver;
	var credentialID = connectionData.credential;
	var type = connectionData.sys_class_name;
	
	if (type == 'orch_jms_ds')
		target = connectionData.provider_url;
	
	if (!validAgentAndTarget(agent, target))
		return;

	var ga = new GlideAjax('CredentialTestAjax');
	ga.addParam('sysparm_target', target);
	ga.addParam('sysparm_credential_id', credentialID);
	ga.addParam('sysparm_port', port);
	ga.addParam('sysparm_agent', agent);
	ga.addParam('ni.nolog.sysparm_credential_data', 'true');
	ga.addParam('ni.nolog.sysparm_target', 'true');
	
	switch (type) {
		case 'jdbc_connection':
			var db_type = getDBType(connectionData.format); 
			var db_name = connectionData.database_name;
			
			if (db_type == "Oracle" ) {
				db_name = connectionData.oracle_sid;
				port = connectionData.oracle_port;
				ga.addParam('sysparm_port', port);
			} else if (db_type == "MSSQL" && connectionData.use_integrated_authentication == "true") {
				ga.addParam('sysparm_use_integrated_authentication', true);
            }
			
			ga.addParam('sysparm_name', 'testCredentialJdbc');
			ga.addParam('sysparm_db_type', db_type);
			ga.addParam('sysparm_db_name', db_name);
			ga.addParam('sysparm_connection_url', connectionURL);
			ga.addParam('sysparm_jdbc_driver', jdbcDriver);
			break;
		case 'orch_jms_ds':
			var initial_context_factory = connectionData.initial_context_factory;
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
			handleError('Failed to test connection: ' + e.message);
		}

	} catch (e) {
		// If not JSON, try legacy flow
		try {
			$('test_form').hide();
			$('test_progress').show();
			$('test_progress').focus();
			checkProgress(answer, agent, gel("timestamp").value, 60);
		} catch (e) {
			handleError('Failed to test connection: ' + e.message);
		}
	}
}

function validateCreds() {
	var connectionDataString = $('connection_data').value;
	var connectionData = JSON.parse(connectionDataString);
	var type = connectionData.sys_class_name;
	var credentialID = connectionData.credential;
	
	var valid = true;
	var errMsg = "";
	
	switch (type) {
		case 'jdbc_connection':
			var dbType = getDBType(connectionData.format);
			var useIntegratedAuth = connectionData.use_integrated_authentication;
			
			if (credentialID === "" && !(dbType === "MSSQL" && useIntegratedAuth === "true")) {
				valid = false;
				errMsg = "Credential cannot be empty for the selected database type";
			}
			break;
			
		default:
			break;
	}
    
	if (!valid) {
		$('test_form').hide();
		handleError(errMsg);
	}
	
	return valid;
}

function getDBType(format) {
	var dbTypeMap = {
		"org.mariadb.jdbc.Driver": "MySQL",
		"oracle.jdbc.OracleDriver": "Oracle",
		"com.microsoft.sqlserver.jdbc.SQLServerDriver": "MSSQL"
	};
	
	return dbTypeMap[format];
}

function actionOK() {
	triggerConnectionTestUseMid();
}

function getErrorMessage(result) {
	return result; //04/15/19 - Change made to support Jdbc Driver update that has changed exceptions being returned
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
