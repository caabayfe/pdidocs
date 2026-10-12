
			
				if (event.parm1.includes('sys_security_acl')){
					var mu = new GlideMultipleUpdate('sys_security_acl');
					mu.addNullQuery('decision_type');
					mu.setValue('decision_type', 'allow');
					mu.execute();
					if (mu.getUpdateCount() > 0){
						gs.log("Update ACL default decision_type event, Updated " + mu.getUpdateCount() + " ACLs with null decision types to have decision_type=allow");
					}
				}
