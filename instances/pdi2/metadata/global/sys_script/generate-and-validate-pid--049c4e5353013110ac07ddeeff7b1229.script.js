(function executeRule(current, previous /* null when async */) {
	try {
		// If a value exists for PID then validate the PID
		if (!gs.nil(current.product_instance_id)) {
			global.AssetProductInstanceUtil.validatePIDForAsset(current, false);
		} else {
			global.AssetProductInstanceUtil.calculatePIDForAsset(current, false);
		}
	} catch (e) {
		gs.addErrorMessage(e.message);
		current.setAbortAction(true);
	}
}(current, previous));
