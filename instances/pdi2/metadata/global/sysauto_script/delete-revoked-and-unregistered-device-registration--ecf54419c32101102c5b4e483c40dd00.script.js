function deleteTokens() {
	try {
		gs.info("Device Trust flow scheduled job started.");
		var deleteTokenGreaterThanTimeInDays = GlideBoundedIntProperty('glide.device.token.revoked.delete.time.in_days', 15, 7, 30);
		var gr = new GlideRecord("sys_auth_policy_device_app_registry");
		
		if(!gr.isValid()) {
			gs.error("Device Trust flow scheduled job: Table sys_auth_policy_device_app_registry is not present.");
			return;
		} 
		
		gr.addQuery('active', false).addOrCondition('is_registered', false);
		gr.query();
		var nowTime;
		while(gr.next() && gr.isValidRecord()) {
			if(!gr.is_registered) {
				var createdTime = new GlideDateTime(gr.last_login_time);
				nowTime = new GlideDateTime();
				createdTime.addSeconds(30*60);
				
				if(nowTime.after(createdTime)) {
					gr.deleteRecord();
				}
			} else if(!gr.active) {
				var updatedTime = new GlideDateTime(gr.last_login_time);
				nowTime = new GlideDateTime();
				updatedTime.addDaysLocalTime(deleteTokenGreaterThanTimeInDays);
				
				if(nowTime.after(updatedTime)) {
					gr.deleteRecord();
				}
			}
		}
		gs.info("Device Trust flow scheduled job ended.");
		
	} catch(ex) {
		gs.error("Error occurred during execution of scheduled Job - Delete Revoked and Unregistered Device registration " + ex);
	}
}
deleteTokens();
