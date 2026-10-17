var topicGr = new GlideRecord("sys_cs_topic");
topicGr.addQuery("model_type", "llm");
topicGr.query();

var skillDocumentVisibilityMap = {};
while (topicGr.next()) {
    skillDocumentVisibilityMap[topicGr.sys_id] = topicGr.visible.toString() === 'true';
}

if (Object.keys(skillDocumentVisibilityMap).length > 0) {
    var skillConfigGr = new GlideRecord("sys_gen_ai_skill_config");
    skillConfigGr.addQuery("skill_id.skill_document", "IN", Object.keys(skillDocumentVisibilityMap).join(','));
    skillConfigGr.query();

    while (skillConfigGr.next()) {
        var skillDocumentId = skillConfigGr.skill_id.skill_document.toString();

        if (skillDocumentVisibilityMap.hasOwnProperty(skillDocumentId)) {
            skillConfigGr.visible = skillDocumentVisibilityMap[skillDocumentId] ? "true" : "false";
            skillConfigGr.update();
            gs.info("Updated visible flag of skill: " + skillDocumentId + " to " + skillDocumentVisibilityMap[skillDocumentId]);
        }
    }
}
