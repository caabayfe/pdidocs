var GenAISkillDefinitionUtil = Class.create();
GenAISkillDefinitionUtil.prototype = {
    initialize: function() {},

    calculateName: function(genAiSkillGr) {
        var skills = sn_one_extend.OneExtendUtil.getAllSkills(); //cached
        var skill = skills.find((skill) => skill.id === genAiSkillGr.getUniqueValue());
        if (skill && skill.metaData) {
            return skill.metaData.name;
        }
        return "";
    },

    calculateDescription: function(genAiSkillGr) {
        var skills = sn_one_extend.OneExtendUtil.getAllSkills(); //cached
        var skill = skills.find((skill) => skill.id === genAiSkillGr.getUniqueValue());
        if (skill && skill.metaData) {
            return skill.metaData.description;
        }
        return "";
    },

    type: 'GenAISkillDefinitionUtil'
};
