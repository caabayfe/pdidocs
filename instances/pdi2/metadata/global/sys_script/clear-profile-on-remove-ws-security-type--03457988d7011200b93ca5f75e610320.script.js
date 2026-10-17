(function executeRule(current, previous /*null when async*/) {
	
	var x509SysId = new ChoiceListHelper("sys_soap_message_function", "ws_security_type").getChoiceSysId("X.509");
    var userNameSysId = new ChoiceListHelper("sys_soap_message_function", "ws_security_type").getChoiceSysId("Username");

    // case: remove X.509 then clear X.509 profile
    if (!gs.nil(current.ws_security_x509_profile) && current.ws_security_type.indexOf(x509SysId) == -1) {
      current.ws_security_x509_profile = "";
      current.use_ws_security = false;
    }

    // case: remove Username then clear Username profile
    if (!gs.nil(current.ws_security_username_profile) && current.ws_security_type.indexOf(userNameSysId) == -1) {
      current.ws_security_username_profile = "";
    }

})(current, previous);
