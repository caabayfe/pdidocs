
			
				(function executeRule(current, previous /*null when async*/ ) {
					var employeeGR = new GlideRecord('sn_employee_profile');
					employeeGR.addQuery('user', current.user.sys_id);
					employeeGR.query();
					if (employeeGR.hasNext()) {
						current.setAbortAction(true);
						gs.addErrorMessage(gs.getMessage('Employee profile already exists for this user'));
					}
				})(current, previous);
