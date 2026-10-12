(function executeRule(current, previous /*null when async*/) {

	GlideCacheManager().remove("sys_choice_compiled", "sys_user.date_format.null.en.1.false");
	GlideCacheManager().remove("sys_choice_compiled", "sys_user.time_format.null.en.1.false");

})(current, previous);
