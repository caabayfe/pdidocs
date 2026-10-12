(function executeRule(current, previous /* null when async */) {
	try {
		// If a value changes for PID then validate the PID
		if (current.product_instance_id.changes()) {
			global.AssetProductInstanceUtil.validatePIDForAsset(current, true);
		} else {
			global.AssetProductInstanceUtil.calculatePIDForAsset(current, true);
		}
	} catch (e) {
		gs.addErrorMessage(e.message);
		current.setAbortAction(true);
	}
}(current, previous));
