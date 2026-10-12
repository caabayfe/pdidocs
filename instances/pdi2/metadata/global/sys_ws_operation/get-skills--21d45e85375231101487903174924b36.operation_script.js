(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
    try {

        var result = [];
        
        var isGenAiActive = new GlidePluginManager().isActive('com.glide.cs.genai');
        var isNowAssistEnabled = false;
        if (isGenAiActive) {
            try {
                isNowAssistEnabled = new sn_nowassist_admin.NowAssistConfig().isNowAssistEnabled();
            } catch (e) {
                isNowAssistEnabled = false;
            }
        }

        if (isNowAssistEnabled) {
            var allSkills = JSON.parse(sn_one_extend.OneExtendUtil.getSkills());
            if (allSkills) {
                for (var i = 0; i < allSkills.length; ++i) {
                    var skillDefinition = {};
                    var skill = allSkills[i];
                    skillDefinition['id'] = skill.id;
                    skillDefinition['table'] = skill.skillTable;
                    skillDefinition['documentId'] = skill.skillDocumentId;
                    skillDefinition['title'] = skill.title;
                    skillDefinition['description'] = skill.metaData.description;
                    var skillAttributes = skill.metaData.attributes;
                    var outputs = [];
                    var inputs = [];
                    for (var s = 0; s < skillAttributes.length; ++s) {
                        var skillAttribute = skillAttributes[s];
                        var attribute = {
                            name: skillAttribute.name,
                            description: skillAttribute.description,
                            mandatory: skillAttribute.mandatory
                        };
                        if (skillAttribute.type == 'OUTPUT') {
                            outputs.push(attribute);
                        } else {
                            inputs.push(attribute);
                        }
                    }
                    skillDefinition['inputs'] = inputs;
                    skillDefinition['outputs'] = outputs;
                    result.push(skillDefinition);
                }
            }
        }

        response.setStatus(200);
        response.setBody({
            skills: result
        });

    } catch (e) {
        response.setStatus(500);
        response.setBody({
            errorMessage: e.message
        });
    }

})(request, response);
