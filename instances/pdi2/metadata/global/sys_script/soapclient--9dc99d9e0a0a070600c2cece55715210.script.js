function soapClient() {
	var soapURL = current.topic;
	var xmlPayload = new GlideXMLDocument();
	xmlPayload.parse(current.payload);
	var cryptoModuleName = "global.com_glide_web_service_consumer_glideencrypter";
	
	var soapDoc = _getSOAPRequestBody(xmlPayload);
	var soapAction = current.name;
	
	var request = new sn_ws.SOAPMessageV2();
	request.setEndpoint(soapURL);
	_addHeaders(xmlPayload, request);
	
	var cred = "";
	try {
		var op = new sn_kmf_ns.KMFCryptoOperation(cryptoModuleName,"SYMMETRIC_UNWRAPPING").withInputFormat("FORMATTED").withAlgorithm("AES");
		cred = GlideStringUtil.base64Decode(op.doOperation(String(current.source)));
	} catch (e) {
		gs.logWarning("Could not decrypt using KMFCryptoOperation in SOAPClient with error " + e);
	}

	if (cred.indexOf(":") > 0) {
		var uname = cred.split(":")[0];
		var pass = cred .split(":")[1];
		request.setBasicAuth(uname, pass);
	}
	
	request.setRequestBody(soapDoc);
	request.setSOAPAction(soapAction);
	var response = request.execute();
	var responseDoc = response.getBody();
	
	var newCurrent = new GlideRecord("ecc_queue");
	newCurrent.initialize();
	newCurrent.topic = current.topic;
	newCurrent.name = current.name;
	newCurrent.source = current.source;
	newCurrent.payload = responseDoc;
	
	if(response.getStatusCode() >= 400) {
		newCurrent.state = "error";
		var errorString = "HTTP status code " + response.getStatusCode();
		newCurrent.error_string = errorString;
	} else if (response.getErrorMessage() != null || response.getErrorMessage() != undefined) {
		newCurrent.state = "error";
		newCurrent.error_string = response.getErrorMessage();
	} else {
		newCurrent.state = "ready";
	}
	
	newCurrent.queue = "input";
	newCurrent.agent = "SOAPClient";
	newCurrent.response_to = current.sys_id;
	newCurrent.insert();
	
	current.state = "processed";
	current.processed = gs.nowDateTime();
}

function _getSOAPRequestBody(xmlPayload){
	var envelop = xmlPayload.selectSingleNode("//" + "envelop");
	if (envelop != null) {
		var soapRequest = GlideXMLUtil.getText(envelop);
		return soapRequest;
	} else {
		return xmlPayload.toString();
	}
}

function _addHeaders(xmlPayload, request){
	var headersElem = xmlPayload.selectSingleNode("//" + "httpHeaders");
	
	if (headersElem != null) {
		var iter = GlideXMLUtil.childElementIterator(headersElem);
		while (iter.hasNext()) {
			var headerElem = iter.next();
			var headerKey = GlideXMLUtil.getAttribute(headerElem,"name");
			var headerValue = GlideXMLUtil.getAttribute(headerElem,"value");
			request.setRequestHeader(headerKey, headerValue);
			
		}
	}
}

soapClient();
