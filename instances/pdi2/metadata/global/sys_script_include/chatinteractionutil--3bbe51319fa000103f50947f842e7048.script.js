var ChatInteractionUtil = Class.create();
ChatInteractionUtil.prototype = {
        initialize: function() {},

        getInteractionByConversation: function(conversationID) {
            var interaction = new GlideRecord('interaction');
            interaction.get('channel_metadata_document', conversationID);
            return interaction;
        },

        getInteractionByGroup: function(groupID) {
            var interactionMetaDataDocumentID = "";
            var handOffGlideRecord = new GlideRecord('sys_cs_connect_handoff');
            if (handOffGlideRecord.get('connect_group', groupID)) {
                interactionMetaDataDocumentID = handOffGlideRecord.cs_conversation;
            } else {
                interactionMetaDataDocumentID = groupID;
            }
            var interaction = new GlideRecord('interaction');
            interaction.get('channel_metadata_document', interactionMetaDataDocumentID);
            return interaction;
        },

        getRequesterLanguage: function(interaction) {
            var requesterLanguage = gs.getSession().getLanguage() + '';
            var contextGR = new GlideRecordSecure('interaction_context');
            contextGR.addQuery('interaction', interaction.sys_id);
            contextGR.addQuery('name', 'requester_session_language');
            contextGR.query();
            if (contextGR.next()) {
                requesterLanguage = contextGR.getValue('value');
            }
            return requesterLanguage;
        },

        getAgentLanguage: function(interaction) {
            var agentLanguage = gs.getSession().getLanguage() + '';
            var contextGR = new GlideRecord('interaction_context');
            contextGR.addQuery('interaction', interaction.sys_id);
            contextGR.addQuery('name', 'liveagent_session_language');
            contextGR.query();
            if (contextGR.next()) {
                agentLanguage = contextGR.getValue('value');
            }
            return agentLanguage;
        },

        getDynamicTranslateLanguage: function(interaction) {
            var setupGR = new GlideRecord("sys_cs_live_agent_setup");
            setupGR.orderBy("sys_updated_on", true);
            setupGR.query();
            var dynamicTranslationEnabled = (setupGR.next() && setupGR.dynamic_translation);
            if (dynamicTranslationEnabled) {
                return this.getAgentLanguage(interaction);
            } else {
                return this.getRequesterLanguage(interaction);
            }
        },

        updateInteractionContext: function(interactionID, jsonObj) {
            var keys = [];
            var contextVar = [];
            var contextVarGr = new GlideRecord("interaction_context");
            contextVarGr.addQuery("interaction", interactionID);
            contextVarGr.query();
            //store existing interaction_context records for this specific interaction
            while (contextVarGr.next()) {
                contextVar[contextVarGr.name] = {
                    sysID: contextVarGr.getUniqueValue() + '',
                    value: contextVarGr.value + '',
                };
            }
            // Add or update values for variables in the json
            for (var key in jsonObj) {
                keys.push(key);
                var isSkillVariable =
                    (key === 'liveagent_optional_skills' || key === 'liveagent_mandatory_skills');

                //if interaction_context record does not exist, add it
                if (contextVar[key].value === undefined) {
                    var newValGr = new GlideRecord("interaction_context");
                    newValGr.initialize();
                    newValGr.interaction = interactionID;
                    newValGr.name = key;
                    newValGr.value = jsonObj[key];
                    newValGr.setWorkflow(isSkillVariable);
                    newValGr.insert();
                } else if (contextVar[key].value != jsonObj[key]) { //if value is different, update it
                    var oldValGr = new GlideRecord("interaction_context");
                    oldValGr.get(contextVar[key].sysID);
                    oldValGr.value = jsonObj[key];
                    oldValGr.setWorkflow(isSkillVariable);
                    oldValGr.update();
                }
            }
            return keys;
        },

        /**
         * Process skills when relevant changes occurred on interaction_context table that are linked to the
         * updates of context variables (liveagent_mandatory_skills or liveagent_optional_skills). As a result,
         * skills will be updated (added or removed) in interaction_m2m_skill table. Skills stored as a value
         * of aforementioned context varaibles, in the format of comma-delimited string (sys_id list).
         *
         * Supported list format
         * ---------------------
         * Without levels: "<skill-1-sysID>,<skill-2-sysID>,..."
         * Example without levels:
         * "76d51f26b3603300290ea943c6a8dcc1,7ad51f26b3603300290ea943c6a8dcbd,c3d55f26b3603300290ea943c6a8dc15"
         *
         * With levels: "<skill-1-sysID>:<skill-1-level-sysID>,<skill-2-sysID>:<skill-2-level-sysID>,..."
         * Example with levels:
         * "76d51f26b3603300290ea943c6a8dcc1:e41a08d6b3332300290ea943c6a8dcdf,bf6497c5b3332300290ea943c6a8dc4f:e0973eaab3203300290ea943c6a8dc41"
         *
         * insert - skills will be added to interaction_m2m_skill
         * update - skills new will be added to, skills non-existent previously will be removed from, interaction_m2m_skill
         * delete - skills will be removed from interaction_m2m_skill
         *
         * @param current: current record of interaction_context, being inserted, updated or deleted
         * @param previous: previous record of interaction_context to be updated; null if insert or delete
         */
        processSkills: function(current, previous) {
            var isMandatory = false;
            switch (current.getValue('name')) {
                case 'liveagent_optional_skills':
                    break;
                case 'liveagent_mandatory_skills':
                    isMandatory = true;
                    break;
                default:
                    return;
            }

            if (current.operation() == 'insert') {
                var interactionInsert = current.getValue('interaction');
                var skillsInsert = current.getValue('value').split(',');
                this.addSkills(interactionInsert, skillsInsert, isMandatory);
            } else if (current.operation() == 'update') {
                var interactionUpdate = current.getValue('interaction');
                var curSkills = current.getValue('value').split(',');
                var prevSkills = previous.getValue('value').split(',');
                var arrayUtil = new ArrayUtil();
                var skillsToAdd = arrayUtil.diff(curSkills, prevSkills);
                var skillsToDelete = arrayUtil.diff(prevSkills, curSkills);
                this.deleteSkills(interactionUpdate, skillsToDelete, isMandatory);
                this.addSkills(interactionUpdate, skillsToAdd, isMandatory);
            } else if (current.operation() == 'delete') {
                var interactionDelete = current.getValue('interaction');
                var skillsDelete = current.getValue('value').split(',');
                this.deleteSkills(interactionDelete, skillsDelete, isMandatory);
            }
        },

        addSkills: function(interaction, skills, isMandatory) {
            for (var i = 0; i < skills.length; i++) {
                var skill = skills[i];
                var level = null;
                var splitIndex = skills[i].lastIndexOf(":");
                if (splitIndex >= 0) {
                    level = skill.substring(splitIndex + 1);
                    skill = skill.substring(0, splitIndex);
                }
                this.setSkill(interaction, skill, isMandatory, level);
            }
        },

        deleteSkills: function(interaction, skills, isMandatory) {
            for (var i = 0; i < skills.length; i++) {
                var skill = skills[i];
                var splitIndex = skills[i].lastIndexOf(":");
                if (splitIndex >= 0) {
                    skill = skill.substring(0, splitIndex);
                }
                this.removeSkill(interaction, skill, isMandatory);
            }
        },

        /**
         * For the given interaction, insert or update the given skill mapping,
         * including the given mandatory status and level (if provided).
         *
         * Fail if an interaction or skill cannot be found matching the arguments.
         *
         * Do not update the level if a skill level cannot be found that matches
         * the arguments and has a level type matching the skill.
         *
         * @param interaction: Sys ID or number of the interaction on which to set the skill
         * @param skill: Sys ID or name of the skill to set
         * @param isMandatory: Should the skill be mandatory?
         * @param level: Sys ID or name of the skill level to set. The level type must match the level type of the skill.
         *
         * @return Sys ID of the inserted or updated interaction_m2m_skill record
         */
        setSkill: function(interaction, skill, isMandatory, level) {
            var interactionGr = this._sanitizeInteraction(interaction);
            var interactionId = (interactionGr == null ? interaction : interactionGr.getUniqueValue());

            var skillGr = this._sanitizeSkill(skill);
            if (skillGr == null)
                return false;
            var skillId = skillGr.getUniqueValue();

            var skillLevelId = this._sanitizeSkillLevel(skillGr, level);

            return this._setSkillUnsafe(interactionId, skillId, isMandatory, skillLevelId);
        },

        _setSkillUnsafe: function(interactionId, skillId, isMandatory, skillLevelId) {
            var isGr = new GlideRecord('interaction_m2m_skill');
            isGr.addQuery('interaction', interactionId);
            isGr.addQuery('skill', skillId);
            isGr.query();
            if (!isGr.next()) {
                isGr.initialize();
                isGr.setValue('interaction', interactionId);
                isGr.setValue('skill', skillId);
            }
            if (isMandatory != null)
                isGr.setValue('mandatory', isMandatory);
            if (skillLevelId != null)
                isGr.setValue('skill_level', skillLevelId);
            return isGr.update();
        },

        /**
         * For the given interaction, remove the given skill mapping.
         *
         * @param interaction: Sys ID of the interaction on which to set the skill
         * @param skill: Sys ID of the skill to set
         * @param isMandatory: (optional) Only remove the skill if its `mandatory` field matches this
         *
         * @return Whether or not the deletion was successful
         */
        removeSkill: function(interaction, skill, isMandatory) {
            var interactionGr = this._sanitizeInteraction(interaction);
            var interactionId = (interactionGr == null ? interaction : interactionGr.getUniqueValue());

            var skillGr = this._sanitizeSkill(skill);
            if (skillGr == null)
                return false;
            var skillId = skillGr.getUniqueValue();

            return this._removeSkillUnsafe(interactionId, skillId, isMandatory);
        },

        _removeSkillUnsafe: function(interactionId, skillId, isMandatory) {
            var isGr = new GlideRecord('interaction_m2m_skill');
            isGr.addQuery('interaction', interactionId);
            isGr.addQuery('skill', skillId);
            if (isMandatory != null)
                isGr.addQuery('mandatory', isMandatory);
            isGr.query();
            if (isGr.next())
                return isGr.deleteRecord();

            var modifier = "";
            if (isMandatory != null)
                modifier = "mandatory=" + isMandatory + " ";
            gs.warn("ChatInteractionUtil: Can not find {0}mapping for interaction {1} to skill {2}",
                modifier, interactionId, skillId);
            return false;
        },

        _sanitizeInteraction: function(interaction) {
            var intGr = new GlideRecord('interaction');
            if (intGr.get(interaction))
                return intGr;

            // No need to warn in this case; interaction might not be found because
            // it is still in the process of being inserted
            return null;
        },

        _sanitizeSkill: function(skill) {
            var skillGr = new GlideRecord('cmn_skill');
            if (skillGr.get(skill))
                return skillGr;
            gs.warn("ChatInteractionUtil: Can not find skill {0}", skill);
            return null;
        },

        _sanitizeSkillLevel: function(skillGr, level) {
            if (level == null)
                return null;

            var skillLevelGr = new GlideRecord('cmn_skill_level');
            var expectedLevelType = skillGr.getValue('level_type');
            skillLevelGr.addQuery('sys_id', level)
                .addOrCondition('name', level);
            skillLevelGr.addQuery('skill_level_type', expectedLevelType);
            skillLevelGr.query();
            if (skillLevelGr.next())
                return skillLevelGr.getUniqueValue();
            gs.warn("ChatInteractionUtil: Can not find skill level {0} with skill level type {1}", level, expectedLevelType);
            return null;
        },

        sendSystemMessage: function(conversation, message, requesterLanguage, agentLanguage, displayName, internal, eventType, publishOnConnectChannel) {
            //if requester's language is the same as the agent's language, no need to send the message twice.
            if (requesterLanguage == agentLanguage) {
                conversation.sendMessage({
                    body: gs.getMessageLang(message, requesterLanguage, [displayName]),
                    system: true,
                    eventType: eventType,
                    internal: internal,
					publishOnConnectChannel: publishOnConnectChannel
                });
            } else {
                //send message to agent only (in agent's language)
                conversation.sendMessage({
                    body: gs.getMessageLang(message, agentLanguage, [displayName]),
                    visibilityType: 'agent_only',
                    system: true,
                    eventType: eventType,
                    internal: internal,
					publishOnConnectChannel: publishOnConnectChannel
                });
                //send message to requester (in requester's language)
                if (!internal) {
                    conversation.sendMessage({
                        body: gs.getMessageLang(message, requesterLanguage, [displayName]),
                        visibilityType: 'requester_only',
                        system: true,
                        eventType: eventType,
                        internal: internal,
						publishOnConnectChannel: publishOnConnectChannel
                    });
                }
            }
        },

        isThirdPartyChatPropertyEnabled: function(adapterProperty, documentTable, documentRecordId) {
            var customAdapterPropertyGr = new GlideRecord('sys_cs_custom_adapter_property');
            customAdapterPropertyGr.addQuery('name', adapterProperty);
            customAdapterPropertyGr.addQuery('document_table', documentTable);
            customAdapterPropertyGr.addQuery('document_record', documentRecordId);
            customAdapterPropertyGr.orderBy('order');
            customAdapterPropertyGr.query();

			var propEnabled = false;

            if (customAdapterPropertyGr.next())
                propEnabled = (customAdapterPropertyGr.getValue('value') === 'true');

            return propEnabled;
        },

		isNative: function(interaction) {
			var providerApplicationId = interaction.provider_application;
			if(!providerApplicationId) {
				return true;
			}
			return !this.isThirdPartyChatPropertyEnabled('third_party_chat', 'sys_cs_provider_application', providerApplicationId);
        },

    type: 'ChatInteractionUtil'
};
