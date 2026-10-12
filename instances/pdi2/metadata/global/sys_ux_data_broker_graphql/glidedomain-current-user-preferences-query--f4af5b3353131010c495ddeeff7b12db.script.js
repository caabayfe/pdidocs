(function buildQuery(query, inputs) {
    var preferences = (inputs.preferences || "").trim().split(",");	  
    query.append("{\r\n  GlideDomain_Query {\r\n");
	query.append("    user {\r\n");
	query.append("      preferences(name: [");
	for (var i = 0; i < preferences.length; i++) {
		var preference = preferences[i].trim();
		if (i > 0)
			query.append(",");
		query.append("\"" + preference + "\"");
	}	
	query.append("]) {\r\n");
	query.append("        name\r\n");
	query.append("        value\r\n");
	query.append("      }\r\n");
	if (inputs.includeRoles) {
		query.append("      roles\r\n");
		query.append("      allRoles\r\n");
		query.append("      groups\r\n");
	}
	query.append("      sys_id\r\n");
	query.append("      userName\r\n");
	query.append("      firstName\r\n");
	query.append("      lastName\r\n");
	query.append("      fullName\r\n");
	query.append("      title\r\n");
	query.append("      avatar\r\n");
	query.append("      initials\r\n");
	query.append("      dateFormat\r\n");
	query.append("      timeZone\r\n");
	query.append("      dateTimeFormat\r\n");
	query.append("      companyId\r\n");
	query.append("      language\r\n");
	query.append("      location\r\n");
	query.append("      smsProvider\r\n");
	query.append("      mobileNumber\r\n");
	query.append("      businessNumber\r\n");
	query.append("      userType\r\n");
	query.append("      country\r\n");
	query.append("      departmentId\r\n");
	query.append("      email\r\n");
	query.append("      countryCallingCode\r\n");
	query.append("    }\r\n");
	query.append("  }\r\n");
    query.append("}");	
})(query, inputs);
