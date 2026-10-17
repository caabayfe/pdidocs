(function buildQuery(query, inputs) {
	// todo:  would be awesome to allow javascript: or gs API calls on broker parameters
    var userSysId = (inputs.userSysId || "").trim();
    if (gs.nil(userSysId))
        userSysId = gs.getUserID();

    var userQuery =
        "{\r\n" +
        "  GlideDomain_Query {\r\n" +
        "    userInfo(sys_id: \"" + userSysId + "\") {\r\n" +
        "      sys_id\r\n" +
        "      userName\r\n" +
        "      fullName\r\n" +
        "      avatar\r\n" +
        "      avatarPath\r\n" +
        "      initials\r\n" +
		"      timeZone\r\n" +			
        "      _query {\r\n" +
        "        GlideRecord_Query {\r\n" +
        "          sys_user_presence(queryConditions: \"user=$$parent.sysId$$\", pagination: {limit: 1}) {\r\n" +
        "            _results {\r\n" +
        "            	sys_id {\r\n" +
        "                	value\r\n" +
        "            	}\r\n" +
        "            	user {\r\n" +
        "            		value\r\n" +
        "            		displayValue\r\n" +
        "            	}\r\n" +
        "            	status {\r\n" +
        "            		value\r\n" +
        "            		displayValue\r\n" +
        "            	}\r\n" +
        "            	sys_updated_on {\r\n" +
        "            		value\r\n" +
        "            		displayValue\r\n" +
        "            	}\r\n" +
        "            }\r\n" +
        "          }\r\n" +
        "        }\r\n" +
        "      }\r\n" +
        "    }\r\n" +
        "  }\r\n" +
        "}";

    query.append(userQuery);
})(query, inputs);
