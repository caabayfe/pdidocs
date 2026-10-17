function textAreaAdjust(element){
	element.style.height = element.scrollHeight + "px";
}

function hideErrorAlert(){
	gel('errorAlert').style.display = "none";
	gel('warningAlert').style.marginBottom = "10px";
}

function hideJSON(){
	hideErrorAlert();
	gel("divJSON").style.display="none";
	gel("divURL").style.display="block";
	return false;
}

function hideURL(){
	hideErrorAlert();
	gel("divURL").style.display="none";
	gel("divJSON").style.display="block";
	return false;	
}


function cancel(){
	GlideDialogWindow.get().destroy();
    return false;
}

function processResponse(response){
	gel("txtJSON").value = '';
	var result = response.responseXML.getElementsByTagName("result");
	if(result && result.length > 0 ){
		var sys_id = result[0].getAttribute("sys_id");
		var error_msg = result[0].getAttribute("error_msg");
		var status = result[0].getAttribute("status");
		
		if(status && sys_id && !error_msg){
			jslog("sys_id of the authenticator record created: " + sys_id);
			getMainWindow().location.href = "sys_authenticator_metadata.do?sys_id="+sys_id;
			GlideDialogWindow.get().destroy();
		} else if(error_msg){
			jslog("Error occurred while importing metadata from url " + error_msg);
			showErrorAlert(" " + error_msg);
			return false;
		}
	}
}

function processMetadataFromURLResponse(response) {
	gel("txtURL").value = '';
	var result = response.responseXML.getElementsByTagName("result");
	if(result && result.length > 0 ){
		var sys_id = result[0].getAttribute("sys_id");
		var error_msg = result[0].getAttribute("error_msg");
		var status = result[0].getAttribute("status");
		
		if(status && sys_id && !error_msg){
			jslog("sys_id of the scheduled job created " + sys_id);
			var msg = {msg:getMessage("Import metadata Job has been scheduled. Please check job status <a href=sys_trigger.do?sys_id=" +  sys_id + " target=_blank>here</a>"), type: "info",id: 'job_scehduled_msg'};
			GlideUI.get().addOutputMessage(msg);
			GlideDialogWindow.get().destroy();
		} else if(error_msg){
			showErrorAlert(" " + error_msg);
			jslog("Error occurred while importing metadata from url " + error_msg);
			return false;
		}
	}
}

function doImport() {
	if(gel('rbJSON').checked && gel('txtJSON').value.trim() !== '') {
		var ajax = new GlideAjax("WebAuthnMetaDataHelper");
		ajax.addParam("sysparm_name", "loadAuthenticatorMetadataFromJSON");
		ajax.addParam("sysparm_meta_json", gel("txtJSON").value.trim());
		ajax.getXML(this.processResponse.bind(this));
		return false;
	}
	
	if(gel('rbURL').checked && gel('txtURL').value.trim() != '') {
        var ajax = new GlideAjax("WebAuthnMetaDataHelper");
		ajax.addParam("sysparm_name", "loadAuthenticatorMetadataFromURL");
		ajax.addParam("sysparm_meta_url_with_token", gel("txtURL").value.trim());
		ajax.getXML(this.processMetadataFromURLResponse.bind(this));
		return false;
	}
	
	return false;
}

function importMetadata() {
	if(!gel('rbURL').checked && !gel('rbJSON').checked){
		showErrorAlert(new GwtMessage().getMessage(" Select an option to import metadata."));
		return false;
	}
	
	if(gel('rbJSON').checked && gel('txtJSON').value.trim() == ''){
		showErrorAlert(new GwtMessage().getMessage(" Enter valid JSON to import metadata from"));
		return false;
	}
	
	if(gel('rbURL').checked && gel('txtURL').value.trim() == ''){
		showErrorAlert(new GwtMessage().getMessage(" Enter a valid URL to import metadata from"));
		return false;
	}	
	
	doImport();
	return false;
}

function showErrorAlert(errorMessage) {
	gel('errorAlert').style.display = "block";
	gel('warningAlert').style.marginBottom = "5px";
	gel("lblError").innerHTML = errorMessage;
	setInvalidStyle();
	setInputFocus();
}

function setInputFocus() {
	if(gel('rbJSON').checked){
		gel('txtJSON').focus();
	}else{
		gel('txtURL').focus();
	}
}

function enterAction(event) {
	if(event.keyCode==13){
		importMetadata();
		return false;
	}
}

function setInvalidStyle() {
	if(gel('rbJSON').checked){
		gel('divJSON').className += " has-error";
	} else {
		gel('divURL').className += " has-error";
	}
}
