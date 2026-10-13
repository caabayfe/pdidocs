function handleInstallNmap() {
	$('nmap_form').hide();
	var outputRecord = null; 
	$('install_progress').show();
	_installNmap(); 
}

/**
 Install Nmap on MID Server host. There is 11 minutes time_out for the installation window. 
**/
function _installNmap(){
	var ga = new GlideAjax('CredentiallessDiscoveryAjax');
	ga.addParam('sysparm_name', 'installNmap');
	ga.addParam('sysparm_agent_sys_id', $('agent_sys_id').value); 
	ga.getXMLWait();
	var result = ga.getAnswer();
	if (result.indexOf('error') == 0) {
		handleError(result); 
		return;
	}
	// Check the installation progress for 11 minutes (probe time out + 1). 
	// After 11 minutes we have a time out error message
	checkProgress(result,13000); 
	
}

/**
 Close the current dialog window and show the error window with the error message back from the installer probe. 
**/
function handleError(error) {
	$('install_progress').hide();
	$('install_failed').show();
	$('err_text').innerHTML = error;
	
} 

/**
 * Search the ecc_queue for the Nmap Installer probe's result
 **/
function checkProgress(ecc_sys_id, time_out) {
	var ga = new GlideAjax('CredentiallessDiscoveryAjax');
	if(time_out <= 0){
		ga.addParam('sysparm_name', 'cancelNmapInstallation');
		ga.addParam('sysparm_output_sys_id', ecc_sys_id);
		ga.getXMLWait();
		ga.getAnswer();
		this.handleError('Nmap Installation Time out');
	}
	
	ga.addParam('sysparm_name', 'checkNmapActionProgress');
	ga.addParam('sysparm_output_sys_id', ecc_sys_id);
	ga.getXMLWait();
	var result = ga.getAnswer();
	
	// Verify the status every 3 seconds(3000 milliseconds)
	if (result.indexOf ('Processing') == 0)  {
		setTimeout(function() { checkProgress(ecc_sys_id, time_out-1); }, 3000);
		return;
	} 
	
	if (result.indexOf('Processed') == 0) {
		$('install_progress').hide();
		$('install_successful').show(); 
		return;
	}
	
	if (result.indexOf('Error: ') == 0) {
		var errMsg = result.substring(7);
		if (errMsg.indexOf('Timeout: Unable to ') != -1)
			errMsg = 'MID server may be busy.  Please retry installation.';
		$('install_progress').hide();
		$('install_failed').show();
		$('err_text').innerHTML = "Nmap installation failed: " + errMsg;
		return; 
	}	
}

/**
 Close the installation window and reload the MID Server form 
**/
function closeInstallationWindow() {
	GlideDialogWindow.get().destroy();
	window.location.reload();
}
