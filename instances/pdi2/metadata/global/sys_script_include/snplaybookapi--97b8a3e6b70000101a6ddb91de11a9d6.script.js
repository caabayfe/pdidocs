var snPlaybookAPI = Class.create();

snPlaybookAPI.STATE_PENDING = 'PENDING';
snPlaybookAPI.STATE_READY = 'READY';
snPlaybookAPI.STATE_IN_PROGRESS = 'IN_PROGRESS';
snPlaybookAPI.STATE_COMPLETE = 'COMPLETE';
snPlaybookAPI.STATE_SKIPPED = 'SKIPPED';
snPlaybookAPI.AI_AGENT_STATUS_CANCELLED = 'CANCELLED';
snPlaybookAPI.AI_AGENT_STATUS_COMPLETED = 'COMPLETED';
snPlaybookAPI.AI_AGENT_STATUS_RUNNING = 'RUNNING';
snPlaybookAPI.EXECUTION_CANCELLED = 'execution_cancelled';
snPlaybookAPI.PD_ACTIVITY_CONTEXT = 'sys_pd_activity_context';
snPlaybookAPI.PD_ACTIVITY_CONVERSATION_M2M = "sys_pd_activity_conversation_m2m";
snPlaybookAPI.GCF_CATEGORY = 'playbook_ai_agent';
snPlaybookAPI.GCF_POINT = 'snc.usage.playbook_ai_agent';
snPlaybookAPI.ACTIVITY_CONTEXT_ID = 'activity_context_id';
snPlaybookAPI.prototype = {
    initialize: function() {},

    setState: function(table, sysId, cardState) {
        var gr = new GlideRecord('sys_pd_activity_context');
        gr.addQuery('associated_table', table);
        gr.addQuery('associated_record', sysId);
        gr.query();
        while (gr.next()) {
            gr.state = cardState;
        }
        gr.updateMultiple();

    },

    getContextRecord: function(sysId) {
        var gr = new GlideRecord(snPlaybookAPI.PD_ACTIVITY_CONTEXT);
        if (gr.get(sysId)) {
            return gr;
        }
        return null;
    },
    recordGCFEvent: function(activityContextId, event) {
        var gcfSampleMap = new GCFSampleMap();
        gcfSampleMap.put(snPlaybookAPI.ACTIVITY_CONTEXT_ID, activityContextId);
        GCFCollector.recordUsageEvent(snPlaybookAPI.GCF_CATEGORY, snPlaybookAPI.GCF_POINT, event, gcfSampleMap);
    },
    cancelAiAgentUsecase: function(contextSysId) {
        try {
            var contextGR = this.getContextRecord(contextSysId);
            if (!contextGR) {
                return {
                    errorType: "MISSING_ARGUMENT",
                    message: gs.getMessage("A required argument is missing or invalid.")
                };
            }
            var currentUser = gs.getUserID();
            var gr = new GlideRecord(snPlaybookAPI.PD_ACTIVITY_CONVERSATION_M2M);
            gr.addQuery('activity_execution', contextSysId);
            gr.addQuery('conversation_id.consumer.user_id', currentUser);
            gr.query();

            if (gr.next()) {
                var conversationId = gr.getValue('conversation_id');
                new sn_cs.VASystemObject.endConversation(conversationId);
                contextGR.setValue('ai_agent_status', snPlaybookAPI.AI_AGENT_STATUS_CANCELLED);
                contextGR.update();
                this.recordGCFEvent(contextSysId, snPlaybookAPI.EXECUTION_CANCELLED)
                return {
                    success: true
                };
            }
            return {
                success: false
            };

        } catch (e) {
            gs.error(gs.getMessage("[AIAgentUtils::cancelAiAgentUsecase] Error in cancelUsecase: {0}", e));
            return {
                errorType: "MUTATION_FAILED",
                message: JSON.stringify(e)
            };
        }
    },

    safeParse: function(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return null;
        }
    },

    // Shared read for writers that merge-write one key into the blob and don't need to distinguish
    // "missing" from "unparseable" — safeParse already returns null for both, this adds the {} fallback.
    getUiStagingResponse: function(contextGR) {
        return this.safeParse(contextGR.ai_agent_ui_staging) || {};
    },

    markAiAgentRecommendationStatus: function(contextSysId, status) {
        try {
            var contextGR = this.getContextRecord(contextSysId);
            if (!contextGR) {
                return {
                    success: false
                };
            }
            var currentUserId = gs.getUserID();
            var uiStagingResponse = {};
            // Parse existing UI staging
            if (contextGR.ai_agent_ui_staging) {
                uiStagingResponse = this.safeParse(contextGR.ai_agent_ui_staging);
                if (!uiStagingResponse) {
                    return {
                        success: false
                    };
                }
            }

            var userResponse = uiStagingResponse[currentUserId];
            if (!userResponse) {
                return {
                    success: false
                };
            }

            if (contextGR.getValue('ai_agent_status') == snPlaybookAPI.AI_AGENT_STATUS_CANCELLED)
                return {
                    success: false
                };

            // Mark user response as accepted
            userResponse.responseStatus = status;
            uiStagingResponse[currentUserId] = userResponse;

            // Save back to record
            contextGR.setValue('ai_agent_ui_staging', JSON.stringify(uiStagingResponse));
            contextGR.setValue('ai_agent_status', snPlaybookAPI.AI_AGENT_STATUS_COMPLETED);
            contextGR.update();
            this.recordGCFEvent(contextSysId, "recommendation_" + status.toLowerCase());
            return {
                success: true
            };

        } catch (e) {
            gs.error(gs.getMessage("[AIAgentUtils::markAiAgentRecommendationStatus] Error updating user acceptance: {0}", e));
            return {
                errorType: "MUTATION_FAILED",
                message: JSON.stringify(e)
            };
        }
    },

    getCurrentUserActivityContextConversationM2mRecord: function(contextSysId) {
        var gr = new GlideRecord(snPlaybookAPI.PD_ACTIVITY_CONVERSATION_M2M);
        gr.addQuery('activity_execution', contextSysId);
        gr.addQuery('conversation_id.consumer.user_id', gs.getUserID());
        gr.query();
        if (gr.next()) {
            return gr;
        }
        return null;
    },

    // Mirrors AgenticConversationValidator's write-access checks (glide) — the frontend already
    // hides the button without write access, but the mutation itself must not rely on that alone.
    canWriteToActivityRecords: function(contextGR) {
        var pdContextGr = new GlideRecord('sys_pd_context');
        if (!pdContextGr.get(contextGR.getValue('context'))) {
            return false;
        }

        var inputTable = pdContextGr.getValue('input_table');
        var inputRecordId = pdContextGr.getValue('input_record');
        var inputGr = new GlideRecord(inputTable);
        if (!inputGr.get(inputRecordId) || !inputGr.canWrite()) {
            return false;
        }

        var associatedTable = contextGR.getValue('associated_table');
        var associatedRecordId = contextGR.getValue('associated_record');
        if (associatedTable && associatedRecordId) {
            var associatedGr = new GlideRecord(associatedTable);
            if (!associatedGr.get(associatedRecordId) || !associatedGr.canWrite()) {
                return false;
            }
        }

        return true;
    },

    initiateAiAgentUsecase: function(contextSysId) {
        try {
            var contextGR = this.getContextRecord(contextSysId);
            if (!contextGR) {
                return {
                    errorType: "MISSING_ARGUMENT",
                    message: gs.getMessage("A required argument is missing or invalid.")
                };
            }

            if (!this.canWriteToActivityRecords(contextGR)) {
                return {
                    errorType: "FORBIDDEN",
                    message: gs.getMessage("You do not have permission to modify this record.")
                };
            }

            var existingM2m = this.getCurrentUserActivityContextConversationM2mRecord(contextSysId);
            if (existingM2m) {
                return {
                    success: true,
                    conversationId: existingM2m.getValue('conversation_id')
                };
            }

            var locals = this.safeParse(contextGR.getValue('locals')) || {};

            var result = sn_fd.FlowAPI.getRunner()
                .action('global.trigger_ai_agent_conversation_for_playbook')
                .inForeground()
                .withInputs({
                    activity_execution: contextSysId,
                    ai_agent_objective: locals.ai_agent_objective || '',
                    ai_agent_execution_mode: locals.ai_agent_execution_mode || '',
                    ai_agent_obj_additional_details: locals.ai_agent_obj_additional_detail || ''
                })
                .run();

            var outputs = result.getOutputs();
            var conversationId = outputs && outputs['conversation_id'];

            if (!conversationId) {
                gs.error("[snPlaybookAPI::initiateAiAgentUsecase] Flow action returned no conversation id for context: " + contextSysId);
                return {
                    errorType: "MUTATION_FAILED",
                    message: gs.getMessage("Failed to start AI agent conversation.")
                };
            }

            var m2mRecord = new GlideRecord(snPlaybookAPI.PD_ACTIVITY_CONVERSATION_M2M);
            m2mRecord.initialize();
            m2mRecord.setValue('conversation_id', conversationId);
            m2mRecord.setValue('activity_execution', contextSysId);
            m2mRecord.insert();

            // Re-fetch: the flow action above seeds this user's formFields via its own separate
            // GlideRecord fetch (_saveExistingFormFieldsToContext). The contextGR fetched at the top
            // of this function is now stale and would clobber those formFields if merged against directly.
            contextGR = this.getContextRecord(contextSysId);
            contextGR.setValue('ai_agent_status', snPlaybookAPI.AI_AGENT_STATUS_RUNNING);
            contextGR.update();

            return {
                success: true,
                conversationId: conversationId
            };
        } catch (e) {
            gs.error(gs.getMessage("[snPlaybookAPI::initiateAiAgentUsecase] Error in initiateAiAgentUsecase: {0}", e));
            return {
                errorType: "MUTATION_FAILED",
                message: JSON.stringify(e)
            };
        }
    },

    type: 'snPlaybookAPI'
};
