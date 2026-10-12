(function executeRule(current, previous /*null when async*/) {

	var isAmbPubSubEnabled = gs.getProperty('glide.amb.pubsub.enabled') === 'true';
    if (isAmbPubSubEnabled) {
		gs.addErrorMessage(gs.getMessage("Changes to sys_amb_n2n_config are blocked when glide.amb.pubsub.enabled is set to true."));
        current.setAbortAction(true);
    }

})(current, previous);
