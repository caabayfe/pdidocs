var g_metadata = null;
var g_isUpdateMode = '${sysparm_update_mode}' === 'true';
var g_clientId = '${sysparm_client_id}';
var g_sysId = '${sysparm_sys_id}';

addLoadEvent(function(){
	if(g_isUpdateMode && g_clientId){
		gel('txtURL').value = g_clientId;
		gel('txtURL').readOnly = true;
		gel('btnCreate').innerHTML = new GwtMessage().getMessage('Update');
		hideInfoAlert();
	}
	gel('txtURL').focus();
});

function hideErrorAlert(){
	gel('errorAlert').style.display = "none";
	gel('infoAlert').style.marginBottom = "10px";
}

function hideInfoAlert(){
	gel('infoAlert').style.display = "none";
}

function hideMetadataForm(){
	gel('metadataForm').style.display = "none";
	gel('btnCreate').style.display = "none";
	gel('fetchMetadataSection').style.display = "block";
	gel('btnFetch').style.display = "inline-block";
	gel('btnCloseOrCancel').style.display = "inline-block";
}

function showMetadataForm(){
	gel('metadataForm').style.display = "block";
	gel('btnCreate').style.display = "inline-block";
	gel('fetchMetadataSection').style.display = "none";
	gel('btnFetch').style.display = "none";
	gel('btnCloseOrCancel').style.display = "none";
}

function cancel(){
	var dialog = GlideDialogWindow.get();
	if(dialog) dialog.destroy();
    return false;
}

function processMetadataResponse(response){
	try {
		if(!response){
			showErrorAlert(new GwtMessage().getMessage("No response received"));
			return;
		}
		
		var result = response.result;
		
		if(result.success === true && result.metadata){
			var metadata = result.metadata;
			
			g_metadata = {
				client_id: metadata.client_id || "",
				client_name: metadata.client_name || "",
				client_uri: metadata.client_uri || "",
				logo_uri: metadata.logo_uri || "",
				redirect_uris: Array.isArray(metadata.redirect_uris) ? metadata.redirect_uris.join(",") : "",
				response_types: Array.isArray(metadata.response_types) ? metadata.response_types.join(",") : ""
			};
			
			hideInfoAlert();
			hideErrorAlert();
			showMetadataForm();
			populateMetadataForm();
		} else {
			var errorMsg = result.error_msg || new GwtMessage().getMessage("Failed to fetch CIMD metadata");
			showErrorAlert(errorMsg);
		}
	} catch(e) {
		showErrorAlert(new GwtMessage().getMessage("Failed to fetch CIMD metadata"));
	}
}

function populateMetadataForm(){
	if(!g_metadata) return;
	
	gel('lblClientId').textContent = g_metadata.client_id || "";
	gel('txtClientName').value = g_metadata.client_name || "";
	gel('txtClientUri').value = g_metadata.client_uri || "";
	gel('txtLogoUri').value = g_metadata.logo_uri || "";
	gel('txtRedirectUris').value = g_metadata.redirect_uris || "";
	gel('txtResponseTypes').value = g_metadata.response_types || "";
}

function fetchMetadata(){
	var url = gel("txtURL").value.trim();
	
	if(url === ''){
		showErrorAlert(new GwtMessage().getMessage("Enter a valid CIMD metadata URL"));
		return false;
	}
	
	hideMetadataForm();
	hideErrorAlert();
	gel('btnFetch').disabled = true;
	gel('btnFetch').innerHTML = new GwtMessage().getMessage("Fetching...");
	
	fetch("/api/now/cimd/metadata?metadata_url=" + encodeURIComponent(url), {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-UserToken': window.g_ck
		}
	}).then(function(response) {
		return response.json();
	}).then(function(data) {
		gel('btnFetch').disabled = false;
		gel('btnFetch').innerHTML = new GwtMessage().getMessage("Fetch Metadata");
		processMetadataResponse(data);
	})['catch'](function(err) {
		gel('btnFetch').disabled = false;
		gel('btnFetch').innerHTML = new GwtMessage().getMessage("Fetch Metadata");
		var errorMsg = (err && err.error_msg) || new GwtMessage().getMessage("Failed to fetch CIMD metadata");
		showErrorAlert(errorMsg);
	});
	
	return false;
}

function processCreateResponse(response){
	try {
		if(!response){
			showErrorAlert(new GwtMessage().getMessage("No response received"));
			gel('btnCreate').disabled = false;
			return;
		}
		
		var result = response.result;
		var success = result.success === true;
		var sys_id = result.sys_id;
		var error_msg = result.error_msg;
		
		if(success){
			var dialog = GlideDialogWindow.get();
			if(dialog) dialog.destroy();
			var parentWindow = window.top || window.parent;
			if(g_isUpdateMode){
				if (parentWindow.g_form)
					parentWindow.g_form.modified = false;
				parentWindow.location.reload();
			} else if(sys_id){
				parentWindow.location.href = "nav_to.do?uri=" + encodeURIComponent("oauth_entity_cimd.do?sys_id=" + sys_id);
			}
		} else {
			var defaultErrorMsg = g_isUpdateMode 
				? new GwtMessage().getMessage("Failed to update CIMD entity") 
				: new GwtMessage().getMessage("Failed to create CIMD entity");
			showErrorAlert(error_msg || defaultErrorMsg);
			gel('btnCreate').disabled = false;
		}
	} catch(e) {
		var defaultErrorMsg = g_isUpdateMode 
			? new GwtMessage().getMessage("Failed to update CIMD entity") 
			: new GwtMessage().getMessage("Failed to create CIMD entity");
		showErrorAlert(defaultErrorMsg);
		gel('btnCreate').disabled = false;
	}
}

function createCIMDEntity(){
	if(!g_metadata){
		showErrorAlert(new GwtMessage().getMessage("Please fetch metadata first"));
		return false;
	}
	
	var metadataUrl = gel("txtURL").value.trim();
	if(!metadataUrl){
		showErrorAlert(new GwtMessage().getMessage("CIMD metadata URL is required"));
		return false;
	}
	
	var configType = document.querySelector('input[name="configType"]:checked');
	if(!configType){
		showErrorAlert(new GwtMessage().getMessage("Please select a configuration type"));
		return false;
	}
	
	if(configType.value === "manual"){
		var clientName = gel('txtClientName').value.trim();
		if(!clientName){
			showErrorAlert(new GwtMessage().getMessage("Client name is required for manual configuration"));
			return false;
		}
		
		var redirectUrisVal = gel('txtRedirectUris').value.trim();
		if(!redirectUrisVal){
			showErrorAlert(new GwtMessage().getMessage("Redirect URIs are required for pinned configuration"));
			return false;
		}
		
		var uris = redirectUrisVal.split(",").map(function(uri){ return uri.trim(); }).filter(function(uri){ return uri !== ""; });
		if(uris.length === 0){
			showErrorAlert(new GwtMessage().getMessage("At least one valid redirect URI is required"));
			return false;
		}
	}
	
	gel('btnCreate').disabled = true;
	hideErrorAlert();
	
	var requestObj = {
		name : g_metadata.client_name,
		client_id: metadataUrl,
		status: configType.value === "live" ? "live" : "manual",
		auth_aig_client: false
	};
	
	if(g_isUpdateMode && g_sysId){
		requestObj.sys_id = g_sysId;
	}
	
	requestObj.localhost_redirection_allowed = gel('chkLocalhostRedirection').checked;
	
	if(configType.value === "manual"){
		requestObj.name = gel('txtClientName').value.trim();
		
		var redirectUris = gel('txtRedirectUris').value.trim();
		if(redirectUris){
			requestObj.redirect_url = redirectUris.split(",").map(function(uri){ return uri.trim(); }).filter(function(uri){ return uri !== ""; });
		}
		
		var responseTypes = gel('txtResponseTypes').value.trim();
		if(responseTypes){
			requestObj.response_types = responseTypes.split(",").map(function(type){ return type.trim(); }).filter(function(type){ return type !== ""; });
		}
		
		var clientUri = gel('txtClientUri').value.trim();
		if(clientUri){
			requestObj.client_uri = clientUri;
		}
		
		var logoUri = gel('txtLogoUri').value.trim();
		if(logoUri){
			requestObj.logo_uri = logoUri;
		}
	}
	
	var endpoint = "/api/now/cimd/client";
	var method = g_isUpdateMode ? "PUT" : "POST";
	
	fetch(endpoint, {
		method: method,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-UserToken': window.g_ck || ''
		},
		body: JSON.stringify(requestObj)
	}).then(function(response) {
		return response.json();
	}).then(function(data) {
		processCreateResponse(data);
	})['catch'](function(err) {
		var defaultMsg = g_isUpdateMode 
			? new GwtMessage().getMessage("Failed to update CIMD entity") 
			: new GwtMessage().getMessage("Failed to create CIMD entity");
		var errorMsg = (err && err.error_msg) || defaultMsg;
		showErrorAlert(errorMsg);
		gel('btnCreate').disabled = false;
	});
	
	return false;
}

function showErrorAlert(errorMessage){
	gel('errorAlert').style.display = "block";
	gel('infoAlert').style.marginBottom = "5px";
	gel("lblError").textContent = errorMessage;
}

function enterAction(event){
	if(event.key === 'Enter'){
		if(!gel('metadataForm').style.display || gel('metadataForm').style.display === 'none'){
			fetchMetadata();
		}
		return false;
	}
}

function onConfigTypeChange(){
	var configType = document.querySelector('input[name="configType"]:checked');
	var pinnedFields = gel('pinnedConfigFields');
	var isLive = configType && configType.value === 'live';
	
	pinnedFields.style.display = 'block';
	
	gel('txtClientName').readOnly = isLive;
	gel('txtRedirectUris').readOnly = isLive;
	gel('txtResponseTypes').readOnly = isLive;
	gel('txtClientUri').readOnly = isLive;
	gel('txtLogoUri').readOnly = isLive;
	
	if(isLive && g_metadata){
		gel('txtClientName').value = g_metadata.client_name || "";
		gel('txtRedirectUris').value = g_metadata.redirect_uris || "";
		gel('txtResponseTypes').value = g_metadata.response_types || "";
		gel('txtClientUri').value = g_metadata.client_uri || "";
		gel('txtLogoUri').value = g_metadata.logo_uri || "";
	}
}
