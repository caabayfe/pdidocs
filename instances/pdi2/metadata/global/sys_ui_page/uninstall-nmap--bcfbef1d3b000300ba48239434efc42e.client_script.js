function handleUninstallNmap() {
	$('nmap_form').hide();
	var outputRecord = null; 
	$('uninstall_progress').show();
	_uninstallNmap(); 
}


function _uninstallNmap(){
	var ga = new GlideAjax('CredentiallessDiscoveryAjax');
	ga.addParam('sysparm_name', 'uninstallNmap');
	ga.addParam('sysparm_agent_sys_id', $('agent_sys_id').value); 
	ga.getXMLWait();
	var result = ga.getAnswer();
	
	if (result.indexOf('error') == 0) {
		handleError(result); 
		return;
	}
	checkProgress(result);
	
}
/**
Close the current dialog window and show the error window with the error message back from the uninstaller probe. 
**/
function handleError(error) {
	$('uninstall_progress').hide();
	$('uninstall_failed').show();
	$('err_text').innerHTML = error;
	
} 

function checkProgress(ecc_sys_id) {
	
	var ga = new GlideAjax('CredentiallessDiscoveryAjax');
	ga.addParam('sysparm_name', 'checkNmapActionProgress');
	ga.addParam('sysparm_output_sys_id', ecc_sys_id);
	ga.getXMLWait();
	var result = ga.getAnswer();
	
	if (result.indexOf ('Processing') == 0)  {
		// Verify the status every 3 seconds(3000 milliseconds)
		setTimeout(function() { checkProgress(ecc_sys_id); }, 3000);
		return;
	} 
	
	if (result.indexOf('Processed') == 0) {
		$('uninstall_progress').hide();
		$('uninstall_successful').show(); 
		return;
	}
	
	if (result.indexOf('Error: ') == 0) {
		$('uninstall_progress').hide();
		$('uninstall_failed').show();
		$('err_text').innerHTML = "Nmap uninstallation failed: " + result.substring(7);
		return; 
	}
		
	
}
/**
 Close the uninstallation window and reload the MID Server form 
**/
function closeUninstallationWindow() {
	GlideDialogWindow.get().destroy();
	window.location.reload();
}
