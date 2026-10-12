	var DEBUG = false;
	answer = getAnswer();

	/*
	 * This script is used for password reset audit purposes.
	 * Returns the total number of user, per credential store (not including SN credential store types) that are enabled for
	 * the password reset application (whether enrolled or not).
	 *
	 * - Password reset is licensed regardless of enrollment status.
	 * - Password reset is licensed per unique sets of credentials managed, (not unique users).
	 *        I.e. same user on multiple credential stores will be counted multiple times.
	 * - Both self-service and service desk channels are chargeable. We don't double-count where both capabilities are available.
	 * - Any credential stores beyond the out-of-the-box remote and local SN will be counted.
	 */
	function getAnswer() {
		if (!GlidePluginManager.isActive('com.glideapp.password_reset'))
			return 0;

		// Retrieve total count of active users:
		var totalUsers = 0;
		var gr_user = new GlideAggregate('sys_user');
		gr_user.addAggregate('COUNT');
		gr_user.addActiveQuery();
		gr_user.query();
		if (gr_user.next()) {
			totalUsers = gr_user.getAggregate('COUNT');
		}
		
		var perCredStoreCount = {};
		
		// Iterates through all non-ServiceNow credentail stores:
		var gr_cs = new GlideRecord('pwd_cred_store');
		var gr_cond = gr_cs.addJoinQuery('pwd_cred_store_type', 'type', 'sys_id');
		gr_cond.addCondition('sys_id', 'NOT IN', 'e611433fbf020100710071a7bf073921, b6e122829f01010054005f29468ba32e');		// filter out SN credential stores
		gr_cs.query();
		while (gr_cs.next()) {
			_debug("DEBUG: Checking credential store '" + gr_cs.name + "'");
			
			// check if cred_store is in an active process:			
			var allUsers = false;
			var groupSet = {};

			// Case #1: check if cred_store is in an active process that is mapped to all users:
			var gr_proc = new GlideRecord('pwd_process');
			gr_proc.addActiveQuery();
			gr_proc.addQuery('cred_store', gr_cs.sys_id);
			gr_proc.addQuery('apply_to_all_users', 'true');
			gr_proc.query();
			if (gr_proc.hasNext()) {
				perCredStoreCount[gr_cs.sys_id] = totalUsers;
			} else {

				// Case #2: get the count of unique users that belong to groups that are mapped to active processes for this credential store:
				var userCount = 0;
				var processList = "";
				
				// Get all active processes that are mapped to the current cred-store:
				var gr_proc2 = new GlideRecord('pwd_process');
				gr_proc2.addActiveQuery();
				gr_proc2.addQuery('cred_store', gr_cs.sys_id);
				gr_proc2.query();
				var first = true;
				while (gr_proc2.next()) {
					processList += (first ? "" : ",") + gr_proc2.sys_id;
					first = false;
				}
				_debug("DEBUG: processList: " + processList);
				
				if (processList != "") {
					// Retrieve the number of unique users in the discovered process list:
					var gr_users = new GlideAggregate('sys_user_grmember');
					gr_users.groupBy('user');
					var gc = gr_users.addJoinQuery('pwd_map_proc_to_group', 'group', 'user_group');
					gc.addCondition('process', 'IN', processList);
					gr_users.query();
					userCount = gr_users.getRowCount();
				}
				perCredStoreCount[gr_cs.sys_id] = userCount;
				
			}
		}
		
		var totalUserCount = 0;
		
		// Sum all results:
	    for (var i in perCredStoreCount) {
			_debug("DEBUG: group: " + i + " count: " + perCredStoreCount[i]);
			totalUserCount += parseInt(perCredStoreCount[i]);
		}
		_debug("DEBUG: Total user count (for licensing): " + totalUserCount);
		
		return totalUserCount;
	}
	
	function _debug(msg) {
		if (DEBUG) {
			gs.log(msg);
		}
	}
