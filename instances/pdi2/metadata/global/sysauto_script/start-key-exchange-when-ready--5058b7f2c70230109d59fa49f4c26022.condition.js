(function() {
	var kmfAutomationInterface = new SNC.KMFAutomationInterface();
	var localInstanceId = gs.getProperty("instance_id");
	var isTargetReady = kmfAutomationInterface.isInstancePublicKeysPresentInNetwork(localInstanceId);
	if (isTargetReady == false)
		gs.error("Resource Exchange: Unable to find instance certificates in the network for local target instance.");
	var keySourceInstanceId = new SNC.KMFKeyExchangePostCloneAPI().getAutoKeyExchangeSourceInstanceId();
	var isKeySourceReady = kmfAutomationInterface.isInstancePublicKeysPresentInNetwork(keySourceInstanceId);
	if (isKeySourceReady == false)
		gs.error("Resource Exchange: Unable to find instance certificates in the network for key source instance.");
	if (canStop() == true || keySourceInstanceId === "") {
		gs.error("Resource Exchange: auto key exchange job expired and the job is cancelled.");
		current.active = false;
		current.update();
	}
	return isTargetReady && isKeySourceReady;
}());


function canStop() {
	var tryCount = parseInt(gs.getProperty("glide_encryption.auto_key_exchange.job_restart_count", 5),10);
	var run_interval = parseInt(gs.getProperty("glide_encryption.auto_key_exchange.job_run_interval", 5),10);
	var run_start = current.run_start.getGlideObject();
	var expectedStopTime = new GlideDateTime();
	expectedStopTime.setDisplayValue(run_start.getDisplayValue());
	expectedStopTime.addSeconds(tryCount * run_interval * 60);
	var now = new GlideDateTime();
	var result = now.after(expectedStopTime);
	return result;
}
