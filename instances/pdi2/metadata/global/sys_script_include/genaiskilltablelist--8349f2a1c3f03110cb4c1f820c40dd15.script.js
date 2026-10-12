var GenAiSkillTableList = Class.create();
GenAiSkillTableList.prototype = {
    initialize: function() {},

    process: function() {

        var skillTables = ['sys_cs_topic', 'sys_one_extend_capability', 'sn_conv_fa_metadata'];

        if (gs.tableExists('sn_aia_usecase')) {
            skillTables.push('sn_aia_usecase');
        }

        if (gs.tableExists('sn_aia_skill_metadata')) {
            skillTables.push('sn_aia_skill_metadata');
        }

        if (gs.tableExists('sn_aia_agent_capability_metadata')) {
            skillTables.push('sn_aia_agent_capability_metadata');
        }

        return skillTables;
    },

    type: 'GenAiSkillTableList'
};
