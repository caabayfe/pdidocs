(function executeRule(current, previous /*null when async*/) {

	new LiveFeedUtil().deleteProfileUserID(new GlideappLiveProfile().getID(current.getUniqueValue()));

})(current, previous);
