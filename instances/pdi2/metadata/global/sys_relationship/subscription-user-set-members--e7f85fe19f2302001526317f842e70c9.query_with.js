(function refineQuery(current, parent) {
	
			// Was this Subscription User Set built with sys_user_group or the sys_user table
			// current = sys_user GR object
			// parent  = sys_user_set GR object
	
			if (parent.getValue('source') == 'sys_user')
				current.addEncodedQuery(parent.getValue('conditions'));
			else if (parent.getValue('source') == 'sys_user_group') {
				var userSysIDs = new UserSetHelper().retrieveUserSetMembers(parent);
				
				// All users who sys id is in the array
				current.addQuery('sys_id', 'IN', userSysIDs.join());
			}
				

})(current, parent);
