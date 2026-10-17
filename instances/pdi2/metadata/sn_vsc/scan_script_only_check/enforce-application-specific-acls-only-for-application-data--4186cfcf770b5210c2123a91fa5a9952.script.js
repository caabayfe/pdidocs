(function(finding) {
    
	// List Updated 06.11.2025 for Zurich
	// Test Property glide.enforce_security_scope.closed_scope removed
	var properties = [
        'glide.enforce_security_scope.sn_uni_task',
        'glide.enforce_security_scope.sn_uni_req',
        'glide.enforce_security_scope.sn_svc_appl_info',
        'glide.enforce_security_scope.sn_professional',
        'glide.enforce_security_scope.sn_opp_market',
        'glide.enforce_security_scope.sn_lg_ops',
        'glide.enforce_security_scope.sn_lg_matter',
        'glide.enforce_security_scope.sn_lg_contracts',
        'glide.enforce_security_scope.sn_jny',
        'glide.enforce_security_scope.sn_ja',
        'glide.enforce_security_scope.sn_imt_vaccine',
        'glide.enforce_security_scope.sn_imt_tracing',
        'glide.enforce_security_scope.sn_imt_health_test',
        'glide.enforce_security_scope.sn_hr_ws',
        'glide.enforce_security_scope.sn_hr_va',
        'glide.enforce_security_scope.sn_hr_sp',
        'glide.enforce_security_scope.sn_hr_pj',
        'glide.enforce_security_scope.sn_hr_pad',
        'glide.enforce_security_scope.sn_hr_mii_base',
        'glide.enforce_security_scope.sn_hr_le',
        'glide.enforce_security_scope.sn_hr_le_ent',
        'glide.enforce_security_scope.sn_hr_hc',
        'glide.enforce_security_scope.sn_hr_gen_ai',
        'glide.enforce_security_scope.sn_hr_er',
        'glide.enforce_security_scope.sn_hr_ef',
        'glide.enforce_security_scope.sn_hr_core',
        'glide.enforce_security_scope.sn_hr_awa',
        'glide.enforce_security_scope.sn_hr_agent_ws',
        'glide.enforce_security_scope.sn_hc_professional',
        'glide.enforce_security_scope.sn_gsm_soc_bnfts',
        'glide.enforce_security_scope.sn_gsm_lic_prmt_ex',
        'glide.enforce_security_scope.sn_gsm_lic_prmt',
        'glide.enforce_security_scope.sn_gsm_info_req',
        'glide.enforce_security_scope.sn_gsm',
        'glide.enforce_security_scope.sn_em',
        'glide.enforce_security_scope.sn_egd_goals',
        'glide.enforce_security_scope.sn_egd_core',
        'glide.enforce_security_scope.sn_egd_act',
        'glide.enforce_security_scope.sn_doc',
        'glide.enforce_security_scope.sn_talent_aia',
        'glide.enforce_security_scope.sn_hr_na_galileo',
        'glide.enforce_security_scope.sn_svc_appl_pgm_mg',
        'glide.enforce_security_scope.sn_hr_ai_agents',
        'glide.enforce_security_scope.sn_hr_mii_base'
    ];
	
    var pm = new GlidePluginManager();

    for (var i = 0; i < properties.length; i++) {
        var property = properties[i];
        var application = property.split('.')[2];
        var propertyValue = gs.getProperty(property, 'false');

        if (pm.isActive(application) && propertyValue.toLowerCase() != 'true') {
            var gr = new GlideRecord('sys_properties');
            if (gr.get('name', property)) {
                finding.setCurrentSource(gr);
            }
            finding.increment();
        }
    }
})(finding);
