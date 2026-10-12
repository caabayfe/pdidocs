		gs.info("Started deleting incorrect migrated User Consent Decisions from the previous release.");
		var sourceConsentGR = new GlideRecord('m2m_user_consent_info');
		sourceConsentGR.addQuery('user_consented_to_tracking_usage!=N^user_consented_to_tracking_usage!=Y');
		sourceConsentGR.setWorkflow(false);
		sourceConsentGR.query();

		var usernameList = [];
		while (sourceConsentGR.next()) {
		    var currUserName = sourceConsentGR.username.toString();
		    usernameList.push(currUserName);
		}

		//Delete only migrated ucm data, whoes decesion are  not modified
		var consentDecisionGR = new GlideRecord('sys_analytics_user_consent_decision');
		consentDecisionGR.addQuery('sys_created_on', 'SAMEAS', 'sys_updated_on');
		consentDecisionGR.addQuery('user.user_name', 'IN', usernameList);
		consentDecisionGR.addQuery('user.active=true^decision=false^sys_updated_by=system^migrated_consent_date!=NULL');
		consentDecisionGR.setWorkflow(false);
		consentDecisionGR.query();
		var deleteCount = consentDecisionGR.getRowCount();
		consentDecisionGR.deleteMultiple();
		gs.info('Complete the deletion of ' + deleteCount + ' incorrectly migrated User Consent Decisions from the previous release.');
