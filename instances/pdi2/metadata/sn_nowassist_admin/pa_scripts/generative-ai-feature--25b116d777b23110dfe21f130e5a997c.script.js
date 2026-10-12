function getFeature(featureObj, skillConfigObj) {
    var featureId = featureObj.sys_id.toString();
    if (gs.nil(skillConfigObj)) return featureId;
    var skillId = skillConfigObj.skill_id.toString();
    var skillConfigId = skillConfigObj.sys_id.toString();
    var skills = [];
    if (!gs.nil(skillId)) {
        skills.push(skillId);
    } else {
        var mapGr = new GlideRecord('sn_ns_config_m2m_skill');
        mapGr.addQuery('skill_config', skillConfigId);
        mapGr.query();
        while (mapGr.next()) {
            skills.push(mapGr.skill_id.toString());
        }
    }
    if (skills.length == 0) return featureId;
    var gr = new GlideRecord('sys_gen_ai_feature_mapping');
    gr.addQuery('document', 'IN', skills);
    gr.query();
    if (gr.next()) {
        return gr.getValue('sys_id');
    }
    return featureId;
};
getFeature(current.feature, current.skill_config_id);
