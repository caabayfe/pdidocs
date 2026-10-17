(function executeRule(current, previous /*null when async*/) {

    if(gs.getProperty("sn_atf_tg.bypass_user_validity_check")) {
      return;
    }

	// Add your code here
	gs.setProperty("sn_atf_tg.username", "");
	gs.warn("Cloud User property was cleared because invalid user was set");

})(current, previous);
