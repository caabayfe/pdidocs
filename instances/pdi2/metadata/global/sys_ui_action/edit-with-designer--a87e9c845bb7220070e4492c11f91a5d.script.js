function openTour() {
	
	var ajax = new GlideAjax('sn_tourbuilder.TourBuilderAjaxUtility');
	ajax.addParam('sysparm_name', 'canUserEditTour');
	ajax.addParam('sysparm_tour_id', g_form.getUniqueValue());
	ajax.getXML(function(response){
		var result = response.responseXML.getElementsByTagName("result");
		
		var userCanEdit = '';
		if(result[0].getAttribute("status") === "success")
			userCanEdit = 'true';
		else
			userCanEdit = 'false';
	
		if(userCanEdit!='true'){
			displayMessage(result[0].getAttribute("message"),'error',true);
			return;
		}
		
		var newWin = window.open('gtb.do?sysparm_tour_id=' + g_form.getUniqueValue() + '&sysparm_nostack=true', "_blank");
		
		//Check if browser's pop-up blocker is enabled and show alert message accordingly
		try {
			if(!newWin || newWin.closed || typeof newWin.closed=='undefined'){
				displayMessage('Disable your popup blocker to use this feature.','error',true);
			}else{
				newWin.focus();   
			}
		} catch (e) {
			displayMessage('Disable your popup blocker to use this feature.','error',true);
		}
	});
}

function displayMessage(msg,msgType,isSticky){
	var gtbGetMsg = new GwtMessage();
	g_GlideUI.display({
			text: gtbGetMsg.getMessage(msg),
			type: msgType,
			sticky: isSticky
		});
}
