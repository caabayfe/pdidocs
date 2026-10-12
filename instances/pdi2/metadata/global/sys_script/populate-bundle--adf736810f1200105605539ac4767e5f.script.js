(function executeRule(current, previous /*null when async*/) {

	function logAndDisplay(message) {
		gs.info(message);
		gs.addInfoMessage(message);
	}
	
	if (!gs.nil(current.certificate_id)) {
		var bundleId = SNC.PushNotification.getBundleFromKeystore(current.certificate_id);
		if (!gs.nil(bundleId)) {
			current.apns_bundle_id = bundleId;
			logAndDisplay("added bundle " + bundleId);
			return;
		}
	}

	if (!gs.nil(current.sandbox_certificate_id)) {
		var sandBoxBundleId = SNC.PushNotification.getBundleFromKeystore(current.sandbox_certificate_id);
		if (!gs.nil(sandBoxBundleId)) {
			current.apns_bundle_id = sandBoxBundleId;
			logAndDisplay("added bundle " + sandBoxBundleId);
			return;
		}
	}

})(current, previous);
