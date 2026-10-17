(function(finding) {

    // List Updated 06.11.2025 for Zurich
    var properties = [
        'sn_opp_market.impersonateCheck',
        'sn_jny.impersonateCheck',
        'sn_imt_vaccine.impersonateCheck',
        'sn_imt_health_test.impersonateCheck',
        'sn_hr_core.impersonateCheck',
        'sn_egd_goals.impersonateCheck',
        'sn_egd_core.impersonateCheck',
        'sn_egd_act.impersonateCheck',
        'sn_em.impersonateCheck',
        'sn_talent_aia.impersonateCheck'
    ];

    var pm = new GlidePluginManager();

    for (var i = 0; i < properties.length; i++) {
        var property = properties[i];
        var application = property.split('.')[0];
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
