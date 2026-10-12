function transform(input) {
    try {
        var util = new sn_nowassist_admin.SkillBuilderNaaUtils();
        var uiDetails = util.getUiActionDeliverySetting(input.skillConfigId);
        var uiActionDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Show {skill_name} in the Core UI using a UI action button as a trigger.", {
            skill_name: uiDetails.skill_name
        });
        var subTitle = sn_i18n.Message.getMessage("sn_nowassist_admin", "Display {skill_name} output in Core UI or in Now Assist panel.", {
            skill_name: uiDetails.skill_name
        });
        var uiActionData = util.getUiActionState(uiDetails.ui_action_id);
        var uiActionState = !gs.nil(uiActionData) ? uiActionData.active === "true" : false;
        var uiActionLink = !gs.nil(uiActionData) ? uiDetails.ui_action_link : "";

        const {
            is_scope_not_matched,
            user_scope,
            record_scope,
            record_scope_name,
            user_scope_name,
            canWrite
        } = new global.ListAndRecordPagePropsUtil().getPageProps('sys_ui_action', uiDetails.ui_action_id);

        var uiScopeNameMessage = sn_i18n.Message.getMessage("sn_nowassist_admin", "<b>Note:</b> You are activating skill in the <b>{user_scope_name}</b> scope. To be able to customize display of the skill in Core UI, change the scope to <b>{record_scope_name}</b> scope. ", {
            user_scope_name: user_scope_name,
            record_scope_name: record_scope_name
        });

        var roles = util.getUiActionRoles(uiDetails.ui_action_id);
        var skillName = uiDetails.skill_name;

        return {
            uiActionDescription,
            uiActionState,
            is_scope_not_matched,
            uiActionLink,
            uiScopeNameMessage,
            subTitle,
            roles,
            skillName
        };
    } catch (error) {
        gs.error("Error occurred in Get UI action details data broker :"+error.toString());
    }
}
