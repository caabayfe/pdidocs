var updateSkillDescriptionCalculation = function() {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "sys_gen_ai_skill");
    gr.addQuery("element", "skill_description");
    gr.query();
    var descriptionCalcScript =
		"(function calculatedFieldValue(current) {" +
			"return new global.GenAISkillDefinitionUtil().calculateDescription(current);" +
		"})(current);";
    if (gr.next()) {
        gr.setValue('calculation', descriptionCalcScript);
        gr.update();
    }
};

var updateSkillNameCalculation = function() {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "sys_gen_ai_skill");
    gr.addQuery("element", "skill_name");
    gr.query();
    var nameCalcScript =
		"(function calculatedFieldValue(current) {" +
			"return new global.GenAISkillDefinitionUtil().calculateName(current);" +
		"})(current);";
    if (gr.next()) {
        gr.setValue('calculation', nameCalcScript);
        gr.update();
    }
};

updateSkillDescriptionCalculation();
updateSkillNameCalculation();
