function transform(input) {
    const LINK_CLICKED_SKILL_ENABLEMENT_NUDGE = 2;
    const LINK_CLICKED_GENERAL_NUDGE = 4;
    const CREATE_CATALOG_ITEM_SKILL = '42bdcc7021d98210f877f506640a1d2d';

    try {
        var isSkillActive = false;
        if (new sn_nowassist_admin.NowAssistSkillConfig().isSkillConfigurationActive(CREATE_CATALOG_ITEM_SKILL)) {
            isSkillActive = true;
        }

        if (!isSkillActive) {
            result = LINK_CLICKED_SKILL_ENABLEMENT_NUDGE;
        } else {
            result = LINK_CLICKED_GENERAL_NUDGE;
        }

    } catch (e) {
        result = LINK_CLICKED_GENERAL_NUDGE;
    }
    return result;
}
