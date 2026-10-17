var NOTIFY_CONFERENCE_DIALOG_MSG = 'NOTIFY_CONFERENCE_DIALOG_MSG';

function setModalParentHeight(animate) {
	var newHeight = $j('#bottomMarker').offset().top;
	var $el = window.parent.$j('#notify_end_conference_dialog .modal-body');
	$el.stop();
	if (!animate) {
		$el.css({
			minHeight: newHeight,
			overflow: 'hidden'
		});
		return;
	}
	$el.animate({
		minHeight: newHeight
	});
}

addLoadEvent(function() {
	
	var ESC = 27;
	document.addEventListener('keyup', function(e) {
		if(e.keyCode == ESC)
			fireMessage('cancel', {});
	});
	setModalParentHeight();
	CustomEvent.on('content_frame.resized', function(name, frameHeight) {
		setModalParentHeight();
	});
	CustomEvent.on('frame.resized', function(name, frameHeight) {
		setModalParentHeight();
	});
	if(typeof NotifyOnTaskClient.updateServiceProviderDetails != 'function') {
		$j('#container').hide();
		$j('#upgrade_error_message').show();	
		return;
	}
		
	NotifyOnTaskClient.updateServiceProviderDetails(serviceProviderDetails);
});

function continueOK() {
	document.getElementById("btn-conf-ok").classList.add('disabled');
	var el = document.getElementById('container');
	el.innerHTML = '<span class="icon-loading"> </span>';
	el.classList.add('container');
	NotifyOnTaskClient.endConference(confData).then(function(result) {
		if(typeof result == 'string')
			result = JSON.parse(result);
		fireMessage('ok', result);
	}, function(result) {
		fireMessage('ok', result);
	});
}

function continueCancel() {
	fireMessage('cancel');
}

function fireMessage(cmd, msg) {
	window.NOW.CustomEvent.fireAll(NOTIFY_CONFERENCE_DIALOG_MSG, {
		cmd: cmd,
		data: msg || {}
	});
}
