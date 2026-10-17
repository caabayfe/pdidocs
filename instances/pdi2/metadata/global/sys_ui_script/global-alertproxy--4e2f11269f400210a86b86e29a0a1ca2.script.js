function alert(message) {
	_notifications_.push({type: "alert", message: message});
}

csGlobals['alert'] = alert;
