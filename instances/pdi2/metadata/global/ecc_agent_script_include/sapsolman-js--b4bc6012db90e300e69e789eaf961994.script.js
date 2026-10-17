var SAPSolman_JS = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var Event   = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;
var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
var	StringUtil= Packages.com.glide.util.StringUtil;

var errorMessage = "";

SAPSolman_JS.prototype = Object.extendsObject(AProbe, {
	// Test the connection with the target monitor
	testConnection : function() {	
		ms.log("Connector testing connection");
		var retVal = {};		
		try {
			if (true) { 
				retVal['status']  = SUCCESS.toString();
			} else {
				this.addError(response.getErrorMessage());
				retVal['status']  = FAILURE.toString();
			}
		} catch (e) {
			this.addError(e.toString());
			retVal['status'] = FAILURE.toString();
		}
		if (retVal['status'] === FAILURE.toString())
			retVal['error_message'] = errorMessage;
		return retVal;
	},

	execute: function() {
		var retVal = {};
		retVal['status'] = SUCCESS.toString();
		return retVal;
	},

	updateSource : function() {
		// Bi-directional: Updating the source
		var jsonStr = this.probe.getAdditionalParameter("alerts"); //get all the alerts data from the Update Queue table
		jsonStr = jsonStr + '';
		//ms.log(jsonStr);
		var objJSON = JSON.parse(jsonStr);
		var command = '';
		var argument = '';
		var jsonRes = '';
		var host = this.probe.getParameter("host");
		var username =  this.probe.getParameter("username");
		var password =  this.probe.getParameter("password");
		var client =  this.probe.getAdditionalParameter("client");
		var port =  this.probe.getAdditionalParameter("port");
		
		var result = false;
		var retVal = {};
		
		if (objJSON == null){
			this.addError("Received json is empty");
			retVal['status']  = "" + FAILURE.toString();
			retVal['error_message'] = errorMessage;
			return retVal;
		}		
		if (host == undefined || host == null || host == '') {
			this.addError("HOST parameter is empty");
			retVal['status']  = "" + FAILURE.toString();
			retVal['error_message'] = errorMessage;
			return retVal;
		}
		if (port == undefined || port == null || port == '') {
			this.addError("PORT parameter is empty");
			retVal['status']  = "" + FAILURE.toString();
			retVal['error_message'] = errorMessage;
			return retVal;
		}
		if (client == undefined || client == null || client == '') {
			this.addError("CLIENT parameter is empty");
			retVal['status']  = "" + FAILURE.toString();
			retVal['error_message'] = errorMessage;
			return retVal;
		}
		var xb64userpass=StringUtil.base64Encode(username+':'+password);
		var alertsToSend = [];
		var alertId = 0;
		for (var i = 0; i < objJSON.length; ++i) {
			var alert = objJSON[i];
			for (var j = 0; j <  alert.value.length; ++j) {
				// What To do ?
				if (alert.value[j].fieldName === 'incident' || alert.value[j].fieldName === 'remote_task_id'){
					command = 'ticket_id';
					argument = alert.value[j].newValue;
				}
				if (alert.value[j].fieldName === 'state' && (alert.value[j].oldValue === 'Open' || alert.value[j].oldValue === 'Reopen') && alert.value[j].newValue === 'Closed'){
					command = 'close';
				}
				if (alert.value[j].fieldName === 'state' && alert.value[j].oldValue === 'Closed' && (alert.value[j].newValue === 'Open' || alert.value[j].newValue === 'Reopen')){
					command = 'open';
				}
				if (alert.value[j].fieldName === 'maintenance' && alert.value[j].oldValue === 'false' && alert.value[j].newValue === 'true'){
					command = 'inmaint';
				}
				if (alert.value[j].fieldName === 'maintenance' && alert.value[j].oldValue === 'true' && alert.value[j].newValue === 'false'){
					command = 'outmaint';
				}
				if (alert.value[j].fieldName === 'acknowledged' && alert.value[j].oldValue === 'false' && alert.value[j].newValue === 'true'){
					command = 'inack';
				}
				if (alert.value[j].fieldName === 'acknowledged' && alert.value[j].oldValue === 'true' && alert.value[j].newValue === 'false'){
					command = 'outack';
				}

				// Now send something to SAP
				if (command != ''){
					this.probe.setParameter("action_performed", "true");

					var alertToSend = {};
					myId=alert.key;

					//ms.log(myId);
					alertToSend.id = myId;
					alertToSend.command = command;
					alertToSend.ticket_id = argument;
					
					alertsToSend[alertId] = alertToSend;

					argument = '';
					jsonRes = JSON.stringify(alertsToSend);
					//ms.log('------ALERT :'+jsonRes);

					result = this.sendAlert(host, port, client, xb64userpass, jsonRes, myId, command);
					command = '';
					if (result == false){
						retVal['status']  = "" + FAILURE.toString();
						retVal['error_message'] = errorMessage;
						return retVal;	
					}
					alertsToSend = [];
					alertId = 0;

				}
			}
		}
		retVal['status']  = "" + SUCCESS.toString();
		return retVal;
	},


	sendAlert : function(host, port, client, pw, body, id, command) {
		try {
			var value='';
			if (command === 'close') {
				value=this.getXMLtosend(id,command);
			}
			if (command === 'inmaint' ) {
				value=this.getXMLtosend(id,'message','ALERT is under MAINTENANCE MODE',1);
			}
			if (command === 'outmaint' ) {
				value=this.getXMLtosend(id,'message','',1);
			}
			if (command === 'inack' ) {
				value=this.getXMLtosend(id,'message','ALERT has been ACKNOWLEDGED',1);
			}
			if (command === 'outack' ) {
				value=this.getXMLtosend(id,'message','',1);
			}
			if (command === 'new' ) {
				value=this.getXMLtosend(id,'updatestatus');
			}
			var PostMethod = Packages.org.apache.commons.httpclient.methods.PostMethod;  
			var GlideHTTPCient = Packages.com.glide.communications.HTTPClient;  
			var httpClient = new GlideHTTPCient();  
			// encode username and password
			var postMethod = new PostMethod('http://'+host+':'+port+'/sap/bc/srt/scs/sap/sap_solman_alert_inbox?sap-client='+client); 
			postMethod.addRequestHeader('Content-Type','text/xml');  
			postMethod.addRequestHeader('Authorization','Basic '+pw);
     		postMethod.setRequestBody(value);

			var httpStatus = httpClient.executeMethod(postMethod);  
			var response = postMethod.getResponseBodyAsString(); 
			postMethod.releaseConnection();  
			if(response.haveError()) {
				this.addError("ERROR: " + response.getErrorMessage() + "  " + response.getBody());
				return false;
			}
			
			return true;
			
		} catch(err) {
			this.addError("Error on sendAlert function. Failed to send data to the source. Error: " + err.message);
			return false;
		}
	},
	
	getXMLtosend: function(id, command, message, overwrite) {
		var xmltosend='';
		if (command === 'close') {
			xmltosend='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style"><soapenv:Header/><soapenv:Body><urn:ConfirmAlertsAtSapInbox><ItAlertsId><item>'+id+'</item></ItAlertsId><IvIgnoreIncidents>?</IvIgnoreIncidents></urn:ConfirmAlertsAtSapInbox></soapenv:Body></soapenv:Envelope>';
		}
		if (command === 'message') {
			xmltosend='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style"><soapenv:Header/><soapenv:Body><urn:AddCommentToAlerts><IvAlertId>'+id+'</IvAlertId><IvNewComment>'+message+'</IvNewComment><IvOverwriteComment>'+overwrite+'</IvOverwriteComment></urn:AddCommentToAlerts></soapenv:Body></soapenv:Envelope>';
		}
		if (command === 'updatestatus' ) {
			xmltosend='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style"><soapenv:Header/><soapenv:Body><urn:SetAlertStatusProcessed><ItAlertsId><item>'+id+'</item></ItAlertsId></urn:SetAlertStatusProcessed></soapenv:Body></soapenv:Envelope>';
		}
		return xmltosend;
	},

	addError : function(message){
		if (errorMessage === "")
			errorMessage = message;
		else
			errorMessage += "\n" + message;
		ms.log(message);
	},
	
type: "SAPSolman_JS"
});
