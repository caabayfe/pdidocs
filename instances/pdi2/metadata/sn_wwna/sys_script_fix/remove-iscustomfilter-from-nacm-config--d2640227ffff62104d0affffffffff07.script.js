var applicabilityGr = new GlideRecord('sn_nowassist_skill_config_applicability');
applicabilityGr.addQuery('skill_config.skill_id', sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID);
applicabilityGr.addEncodedQuery('filter_parametersLIKEisCustomFilter');
applicabilityGr.query();
var filter;
while (applicabilityGr.next()) {
    filter = applicabilityGr.getValue('filter_parameters');
    if (filter) {
        filter = typeof filter === 'string' ? JSON.parse(filter) : filter;
        if (filter.hasOwnProperty('isCustomFilter')) {
            delete filter['isCustomFilter'];
            applicabilityGr.setValue('filter_parameters', JSON.stringify(filter));
            applicabilityGr.update();
        }
    }
}
