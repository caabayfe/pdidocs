var service_id = jQuery('#service_id').val();
var is_convert_op = jQuery('#is_convert_op').val();

function onCancel() {
 GlideDialogWindow.get().destroy();
 return false;
}

function infoBannerMessage() {
	var is_update = jQuery('#is_update').val();
	if ('true' == is_update) {
		jQuery('#update_msg').css('display', '');
	} else {
		jQuery('#convert_msg').css('display', '');
	}
}
infoBannerMessage();

function displayUpdateWithCMDBChanges(){
	var is_already_converted = jQuery("#is_already_converted").val();
	if ('true' == is_already_converted){
		jQuery('#displayCMDBupdate').css('display', 'none');
	}
}
displayUpdateWithCMDBChanges();

function validateForm() {
	var levels = jQuery('#levels').val();
	var dynamic = jQuery('#dynamic')[0].checked;
	
	if (jQuery("#is_already_converted").val()) {
		dynamic = false ;
	}
	
	/* We need to call ajax since redirecting from this ui page will cause only the internal frame to get redirected.
	going to ajax enables us to redirect the entire page from there */
	var ga = new GlideAjax('PopulateManualServiceAjax');
	ga.addParam('sysparm_name', 'process');
	ga.addParam('sysparm_service_id', service_id);
	ga.addParam('sysparm_levels', levels);
	ga.addParam('sysparm_is_dynamic', dynamic);

	jQuery("#it_service_choose_levels_to_populate .modal-title").text("Converting to Application Service");
	var containerElm = jQuery('#it_service_choose_levels_to_populate .modal-body');
	var bodyH = (containerElm.height() || 100) + "px";
	var descriptionMsg1 = "$[gs.getMessage('We are creating an application service and updating it with CIs from the CMDB.')]";
	var descriptionMsg2 = "$[gs.getMessage('It may take a few minutes.')]";
	containerElm.empty();
	containerElm.append('<div style="height:' + bodyH + '"><div style="text-align:left;font-size:16px;padding-bottom:50px"><div>' + descriptionMsg1 + '</div><div>' + descriptionMsg2 + '</div></div><div style="text-align:center"><div class="icon-loading"/></div></div>');
	ga.getXML(getAns);
	return false;
}

function getAns(response) {
	var url = "/$sa_business_service.do?sysId=" + service_id;
	var answer = response.responseXML.documentElement.getAttribute("answer");
	
	if (answer) {
		var error = answer.evalJSON();

		if (error.error_source === 'ACL' || error.error_source === 'convertToITService') {
			//stopping here if reclassification was interrupted.
			//not redirecting to app_service form, the service is still cmdb_ci_service_discovered
			//error printed from PopulateManualServiceAjax in both cases (ACL or convertToITService)
			GlideDialogWindow.get().destroy();
			return;
		} else {
			//assuming that reclassification succeeded, but error occured on later phase (presumably, in populateDiscoveredService)
			//the error was put in clientData by PopulateManualServiceAjax
			//setting here flag in URL to read the error from clientData on app_service screen.
			//from this flow, must redirect to app_service form screen
			url += "&error_in_server=true";
		}

	} else if (is_convert_op == 'true') {
		url += "&service_just_converted=true";

	} else {
		url += "&service_just_populated=true";

	}

	//PRB1245510: ensure redirect on main frame.
	//If current browser tab has nav_to.do URL, then window.top will have mainFrame.
	//otherwise, the page is standalone (no SN navigation menu wrapping), in such case top window should redirect.
	redirectOnMainFrame(url);
}
/**
 * This function finds main frame and redirect on it with provided URL.
 * It was tested on chrome, FF6, IE11, Edge17.
 */
function redirectOnMainFrame(url) {
	var frames = window.top.document.getElementsByTagName("iframe");

	//MS Edge browser doesn't work with window.frames, which is the reason for this loop.
	for (var i = 0; i < frames.length; i++) {
		if (frames[i].name === "gsft_main") {
			frames[i].setAttribute("src", url);
			return;
		}
	}

	//gsft_main not found, assuming standalone window and redirecting top frame
	window.top.location.href = url;
}

jQuery(document).ready(function() {
	var levels = parseInt(jQuery('#default_levels').val());
    jQuery('#levels option[value="' + levels + '"]').attr('selected', 'true');

	//remove type=submit to prevent form submission
	jQuery('#ok_button, #cancel_button').attr('type', null); 
});
