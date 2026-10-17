//initial display
function onLoad() {
	
	if (g_form.isNewRecord())
		g_form.addInfoMessage(new GwtMessage().getMessage('clone.form.label.new.cloneapp'));

	if(g_scratchpad.isAppEnabled == 'false') {
		showAppDisabledDialog();
		return;
	}
	
	try {
		if(g_form.isNewRecord()) {
			if(g_scratchpad.debugMode == "true") {
				var _dialog = new GlideDialogWindow('clone_debug_mode_warning_popup');
				_dialog.setTitle('');
				_dialog.removeCloseDecoration();
				_dialog.render();
			} else {
				getDefaultCloneProfile();
				loadCloneOptionsFromProfile();
			}
		}
		
		var targetInstancePlaceHolderText = new GwtMessage().getMessage("clone.field.label.help.targetinstance");
		var targetInstanceFieldName = "sys_display.clone_instance.target_instance";
		var scheduledPlaceHolderText = new GwtMessage().getMessage("clone.field.label.help.schedulestarttime");
		var scheduledFieldName = g_form.getControl('scheduled').name;
		addDefaultPlaceHolder(targetInstanceFieldName,targetInstancePlaceHolderText);
		addDefaultPlaceHolder(scheduledFieldName,scheduledPlaceHolderText);
	} catch(e) { } // hide any exceptions we get
	finally {
		isRedirectEnabled(function(setRedirect) {
			if (setRedirect === "true") {
				setTimeout(function() {
					window.location.href = 'now/clone/ui/clone-request/-1';
				}, 30000);
			}
		});
	}
 }

 function isRedirectEnabled(callback) {
	var setRedirect = "true";
	var ga = new GlideAjax('InstanceCloneManagerAjax');
	ga.addParam('sysparm_name', 'isRedirectEnabled');
	ga.getXMLAnswer(function(response) {
        var result = (response !== null && response !== "") ? response : setRedirect;
        callback(result); 
    });
 }

function showAppDisabledDialog() {
	var dialog = new GlideModal('glide_modal_confirm', true, 400);
	dialog.setTitle(new GwtMessage().getMessage('Warning !!'));
	dialog.setPreference('body', new GwtMessage().getMessage("This application is disabled by your administrator. Please use the updated System Clone module to initiate clones."));
	dialog.setPreference('focusTrap', true);
	dialog.setPreference('buttonLabelComplete', new GwtMessage().getMessage('OK'));
	dialog.setPreference('buttonLabelCancel', new GwtMessage().getMessage('Cancel'));
	dialog.render();
}

function loadCloneOptionsFromProfile() {
	var profile = g_form.getValue('profile');
	
	var ga = new GlideAjax('InstanceCloneManagerAjax');
	ga.addParam('sysparm_name', 'getCloneOptionsFromProfile');
	ga.addParam('sysparm_cloneProfile', profile);
	ga.getXML(function(response) {
		if (response != null) {
			var answer = response.responseXML.documentElement.getAttribute("answer")||'';
			answer = answer.evalJSON();//Decode Response as JSON Object
			
			for (var jsonKey in answer) 
				if(answer.hasOwnProperty(jsonKey)) 
					g_form.setValue(jsonKey, answer[jsonKey]);
			}
	});
}

function getDefaultCloneProfile() {
	var profile = g_form.getValue('profile');
	if(profile != null && profile != '')
		return;
	
	var ga = new GlideAjax('InstanceCloneManagerAjax');
	ga.addParam('sysparm_name', 'getDefaultCloneProfile');
	ga.getXML(function(response) {
		if (response != null) {
			var answer = response.responseXML.documentElement.getAttribute("answer")||'';
			answer = answer.evalJSON();//Decode Response as JSON Object
			if(answer['profile'] != null && answer['profile'] != '') 
				g_form.setValue('profile', answer['profile']);
		}
	});
}

function getEstimatedCloneEndDate() {
	g_form.hideFieldMsg('occurrences');
	var scheduledTime = g_form.getValue('scheduled');
	var cloneFrequency = g_form.getValue('clone_frequency');
	var occurrence = g_form.getValue('occurrences');
	if(scheduledTime != '' && cloneFrequency != '' && occurrence != '') {
		var ga = new GlideAjax('InstanceCloneManagerAjax');
		ga.addParam('sysparm_name', 'getRecurringCloneEndDate');
		ga.addParam('sysparm_cloneStartTime', scheduledTime);
		ga.addParam('sysparm_cloneFrequency', cloneFrequency);
		ga.addParam('sysparm_occurrence', occurrence);
		ga.getXML(getEstimatedCloneEndDateResponse);
	}
}

function getEstimatedCloneEndDateResponse(response) {
	g_form.hideFieldMsg('occurrences');
	if (response != null) {
		var answer = response.responseXML.documentElement.getAttribute("answer")||'';
		answer = answer.evalJSON();//Decode Response as JSON Object
		if(answer.cloneEndTime != null && answer.cloneEndTime != '') 
			g_form.showFieldMsg('occurrences', 'Estimated End Date : ' + answer.cloneEndTime);
	}
}

function setMaxCloneOccurrence() {
	var CLONE_FREQUENCY_WEEKLY = 1;
	var CLONE_FREQUENCY_BIWEEKLY = 2;
	var CLONE_FREQUENCY_MONTHLY = 3;
	var DEFAULT_MAX_OCCURRENCES = 3;

	if(g_scratchpad.maxCloneDuration == undefined || g_scratchpad.maxCloneDuration == '') 
		return;

	var maxCloneDurationRestriction = g_scratchpad.maxCloneDuration;
	var maxCloneOccurrences = parseInt(maxCloneDurationRestriction.substr(0, maxCloneDurationRestriction.length - 1));
	var maxDurationSuffix = maxCloneDurationRestriction.charAt(maxCloneDurationRestriction.length - 1);
	var cloneFrequency = g_form.getValue('clone_frequency');
	if(maxDurationSuffix == 'M') {
		if(cloneFrequency == CLONE_FREQUENCY_WEEKLY) 
			maxCloneOccurrences = (maxCloneOccurrences * 4) + 1;
		else if(cloneFrequency == CLONE_FREQUENCY_BIWEEKLY) 
			maxCloneOccurrences = (maxCloneOccurrences * 2) + 1;
		else if(cloneFrequency == CLONE_FREQUENCY_MONTHLY) 
			maxCloneOccurrences = maxCloneOccurrences + 1;

	} else if(maxDurationSuffix == 'W') {
		if(cloneFrequency == CLONE_FREQUENCY_WEEKLY) 
			maxCloneOccurrences = maxCloneOccurrences + 1;
		else if(cloneFrequency == CLONE_FREQUENCY_BIWEEKLY) 
			maxCloneOccurrences = Math.floor(maxCloneOccurrences/2) + 1;
		else if(cloneFrequency == CLONE_FREQUENCY_MONTHLY) 
			maxCloneOccurrences = Math.floor(maxCloneOccurrences/4) + 1;

	} else if(maxDurationSuffix == 'D') {
		if(cloneFrequency == CLONE_FREQUENCY_WEEKLY) 
			maxCloneOccurrences = Math.floor(maxCloneOccurrences/7) + 1;
		else if(cloneFrequency == CLONE_FREQUENCY_BIWEEKLY) 
			maxCloneOccurrences = Math.floor(maxCloneOccurrences/14) + 1;
		else if(cloneFrequency == CLONE_FREQUENCY_MONTHLY) 
			maxCloneOccurrences = Math.floor(maxCloneOccurrences/30) + 1;
	} else {
		if(cloneFrequency == CLONE_FREQUENCY_WEEKLY) 
			maxCloneOccurrences = (DEFAULT_MAX_OCCURRENCES * 4) + 1;
		else if(cloneFrequency == CLONE_FREQUENCY_BIWEEKLY) 
			maxCloneOccurrences = (DEFAULT_MAX_OCCURRENCES * 2) + 1;
		else if(cloneFrequency == CLONE_FREQUENCY_MONTHLY) 
			maxCloneOccurrences = DEFAULT_MAX_OCCURRENCES + 1;
	}

	g_scratchpad.maxCloneOccurrences = maxCloneOccurrences;
	g_form.setValue('occurrences', maxCloneOccurrences);
}

function addDefaultPlaceHolder(fieldName,placeHolderText) {
	if (Prototype.Browser.IE) 
		fieldName.placeholder = placeHolderText;
	else 
		$(fieldName).writeAttribute('placeholder', placeHolderText);

}
