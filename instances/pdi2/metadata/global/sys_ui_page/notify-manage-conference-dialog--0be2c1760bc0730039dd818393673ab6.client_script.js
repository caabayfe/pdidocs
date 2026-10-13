var NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG = 'NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG';

function joinConferenceCall(confCallSysId, serviceProvider) {
	showLoadingIcon();
	var data = NotifyOnTaskClient.getNotifyActionTemplate();
	data.confId = confCallSysId;
	data.serviceProvider = serviceProvider;
	data.addToWorkNotes = true;
	NotifyOnTaskClient.selfJoin(data).then(function(response) {
		joinConfCallbackFn(response);
	}, function(response) {
		joinConfCallbackFn(response);		
	});
}

function joinConfCallbackFn(response) {
	setModalParentHeight();
	if (response) {
		window.NOW.CustomEvent.fireAll(NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG, {cmd : 'joinconference', data: response});
	}
	hideLoadingIcon();
}

function addParticipants(confCallSysId) {
	var data = {
		confId : confCallSysId,
		addToWorkNotes : true
	};
	window.NOW.CustomEvent.fireAll(NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG, {cmd: 'addparticipant', data: data});
}

function endConferenceCall(confCallSysId, serviceProvider) {
	var data = {
		confId : confCallSysId,
		serviceProvider : serviceProvider
	};
	window.NOW.CustomEvent.fireAll(NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG, {cmd: 'endconference', data: data});
}

function showLoadingIcon() {
	var loading = document.getElementById("loading");
	loading.style.display = "block";
	var content = document.getElementById("content");
	content.style.display = "none";
}

function hideLoadingIcon() {
	var loading = document.getElementById("loading");
	loading.style.display = "none";
	var content = document.getElementById("content");
	content.style.display = "block";
}

function setModalParentHeight(animate) {
	var newHeight = $j('#bottomMarker').offset().top;
	var $el = window.parent.$j('#notify_manage_conference_dialog .modal-body');
	$el.stop();
	if (!animate) {
		$el.css({
			minHeight: newHeight
		});
		return;
	}
	$el.animate({
		minHeight: newHeight
	});
}

// Called when the form loads
addLoadEvent(function() {
	
	var $el = window.parent.$j('#notify_manage_conference_dialog .modal-body');
	$el.css({minHeight: 100});
	
	if(document.body.addClassName)
		document.body.addClassName('no-overflow');

	var ESC = 27;
	setModalParentHeight();

	CustomEvent.on('content_frame.resized', function(name, frameHeight) {
		setModalParentHeight();
	});
	CustomEvent.on('frame.resized', function(name, frameHeight) {
		setModalParentHeight();
	});
	
	document.addEventListener('blur', function(e) {
		if(!window.g_active_ac)
			return;
		setTimeout(function() {
			setModalParentHeight();
		}, 16);
	}, true);
	
	document.addEventListener('keydown', function(e) {
		if(e.keyCode == ESC) {
			window.NOW.CustomEvent.fireAll(NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG, {cmd: 'cancel', data:[]});
		}
	}, true);
	if(typeof NotifyOnTaskClient.updateServiceProviderDetails != 'function') {
		$j('#content').hide();
		$j('#upgrade_error_message').show();
		return;
	}
	NotifyOnTaskClient.updateServiceProviderDetails(serviceProviderDetails);
	
});
