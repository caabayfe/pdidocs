(function executeRule(current, previous) {
			var propGR = new GlideRecord('sys_sg_properties');
			propGR.addQuery('name', current.name);
			propGR.addQuery('sys_scope', current.sys_scope);
			propGR.addQuery('is_public', current.is_public);
			
			if (current.native_client != null) {
				propGR.addQuery('native_client', current.native_client);
			}

			if (current.mobile_application != null) {
				propGR.addQuery('mobile_application', current.mobile_application);
			}

			propGR.query();
			while(propGR.next()) {
				if(propGR.getUniqueValue() != current.getUniqueValue()) {
					gs.addInfoMessage(gs.getMessage('Property name must be unique'));
					current.setAbortAction(true);
					break;
				}
			}
			})(current, previous);
