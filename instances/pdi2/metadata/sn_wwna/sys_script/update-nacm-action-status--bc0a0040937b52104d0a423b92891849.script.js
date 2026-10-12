(function executeRule(current, previous /*null when async*/ ) {
    var skillId = current.skill_config.skill_id;
    var utils = new sn_wwna.NAAWWNAUtils();
    if (skillId == sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID && current.active) {
        var skillToSkillConfigMap = utils.fetchM2MSkillMap(false, [current.skill_config]);
        if (skillToSkillConfigMap[current.skill_config]) {
            current.in_product_active = true;
            current.update();
        }
    }
    if (skillId && !current.active) {
        let statusGr = new GlideRecord(sn_wwna.WWNAConstants.TABLES.SKILL_CONFIG_STATUS);
        statusGr.addQuery('skill_config.skill_id', skillId);
        statusGr.addQuery('active', true);
        statusGr.query();
        if (!statusGr.next()) {
            let gr = new GlideRecord(sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS);
            gr.addQuery('skill', skillId);
            gr.setValue('active', false);
            gr.updateMultiple();
        }

    }
    utils.updateMappedNACMConfig(current);
    // Add your code here

})(current, previous);
