(function executeRule(current, previous /*null when async*/ ) {
    try {
		SNC.MultifactorAuthUtil.markNonRecentFactor(current.user, current.factor_type);
    } catch (e) {
        gs.error("Set Most Recent Used Factor BR: error occured while setting the recent factor for user:" + current.user + ", error: " + e);
	}
})(current, previous);
