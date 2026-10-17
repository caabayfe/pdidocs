(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    if (GlidePluginManager.isActive("sn_uxc_gen_ai")) {

        var table = request.pathParams.table;
        var sysId = request.pathParams.sys_id;

        var emailSkillUtils = new sn_uxc_gen_ai.UXCGenAIEmailReplyUtils();
        if (table === 'sys_email_draft') {
            var gr = new GlideRecordSecure(table);
            if (gr.get(sysId)) {
                table = gr.getValue('target_table');
                sysId = gr.getValue('target_record');
            }
        }

        var appliedTemplate;
        var templatesBrandingDetails = {};
        try {
            var config = emailSkillUtils.getSkillAvailability(table, sysId);
            var PTAConfig = {};
            if (typeof sn_wwna !== 'undefined' && typeof sn_wwna.PredictiveTextAssistanceUtils !== 'undefined') {
                PTAConfig = new sn_wwna.PredictiveTextAssistanceUtils().getSkillConfigByFilterParams('02766dd4ff427210bb83ffffffffff97', {
                    type: 'email',
                    table
                });
            }
            var ptaConfigAvailability = new sn_uxc_gen_ai.UXCGenAIUtils().checkSkillAvailability({
                    table,
                    record_sys_id: sysId
                },
                PTAConfig
            );
            if (!ptaConfigAvailability)
                PTAConfig = undefined;

            if (config?.replySkillConfig?.active) {
                templatesBrandingDetails = emailSkillUtils.getTemplatesBrandingDetails(table, sysId);
            }
            return {
                config: config,
                PTAConfig: PTAConfig,
                templatesBrandingDetails: templatesBrandingDetails
            };
        } catch (e) {
            return {
                evaluatedAvailability: false
            };
        }
    } else {
        return {
            evaluatedAvailability: false
        };
    }

})(request, response);
