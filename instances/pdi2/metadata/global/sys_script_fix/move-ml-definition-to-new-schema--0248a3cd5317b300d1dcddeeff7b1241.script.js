if (!pm.isZboot()) {
	/*
	OOB Solution definitions need to be skipped if plugin uses other than com.glide.platform_ml plugin in the if folder to checkin OOB solution definition. There is problem of overriding the OOB solution definition sys_id with sequence in which plugins are installed.
	OOB Solution Definition
		NlU 
			'ml_setup_topics_model', 'ml_sn_itsm_nlu_itsm_nlu_for_va', 'ml_sn_csm_nlu_customer_service_nlu_model', 'ml_sn_hr_nlu_hr_nlu'
			
		CSM contextual search 
			'ml_sn_global_all_similar_cases', 'ml_sn_global_recommended_resolved_cases', 'ml_sn_global_major_issue_detector', 'ml_sn_global_recommended_open_cases', 'ml_sn_global_articles_similar_to_cases', 'ml_sn_global_knowledge_similar_articles'
		
		ITSM contextual search
			'ml_sn_global_similar_open_incidents', 'ml_sn_global_similar_resolved_incidents', 'ml_sn_global_similar_incidents', 'ml_sn_global_articles_similar_to_incidents', 'ml_sn_global_major_incident_recommendation'
		
		Major incident management 'ml_sn_global_similar_incidents_mim'
		Incident management 'ml_incident_categorization','ml_incident_assignment'
	
	*/
	var solutionArr = ['ml_setup_topics_model', 'ml_sn_itsm_nlu_itsm_nlu_for_va', 'ml_sn_csm_nlu_customer_service_nlu_model', 'ml_sn_hr_nlu_hr_nlu', 'ml_sn_global_all_similar_cases', 'ml_sn_global_recommended_resolved_cases', 'ml_sn_global_major_issue_detector', 'ml_sn_global_recommended_open_cases', 'ml_sn_global_articles_similar_to_cases', 'ml_sn_global_knowledge_similar_articles','ml_sn_global_similar_open_incidents', 'ml_sn_global_similar_resolved_incidents', 'ml_sn_global_similar_incidents', 'ml_sn_global_articles_similar_to_incidents', 'ml_sn_global_major_incident_recommendation','ml_sn_global_similar_incidents_mim','ml_incident_categorization','ml_incident_assignment'];
	new MLSchemaFixScriptHelper().fixMLSchemaforOrlandoUpgrade(solutionArr, 'exclude');
}
