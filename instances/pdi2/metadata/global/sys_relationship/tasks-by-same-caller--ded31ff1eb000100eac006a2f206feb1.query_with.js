var callerID = parent.caller;
    if( JSUtil.notNil(callerID) ) {
		var inc = "sys_class_name=incident^active=true^ref_incident.caller_id="+callerID;
		var prb = "sys_class_name=problem^active=true^opened_by="+callerID;
		var chg = "sys_class_name=change_request^active=true^ref_change_request.requested_by="+callerID;
		var scr = "sys_class_name=sc_request^active=true^ref_sc_request.requested_for="+callerID;
		
		current.addEncodedQuery(inc+"^NQ"+prb+"^NQ"+chg+"^NQ"+scr);
    }
	else
    	current.addEncodedQuery("sys_idISEMPTY");	
