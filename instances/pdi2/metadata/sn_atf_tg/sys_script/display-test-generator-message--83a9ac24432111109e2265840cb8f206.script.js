(function executeRule(current, previous /*null when async*/) {

	if (current.isNewRecord() && gs.hasRole('admin'))
		gs.addInfoMessage(gs.getMessage('ATF_TG:suggest_test_generator', 'href="/now/sn_atf_tg/test_generator"'));

})(current, previous);
