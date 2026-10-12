function transform(input) {
    const pluginID = 'com.sn.now.creator';
    var hideNudge = false;
    var pMgr = new GlidePluginManager();
    const CREATE_CATALOG_ITEM_SKILL = '42bdcc7021d98210f877f506640a1d2d';
    var params = {};

    if (pMgr.isActive(pluginID)) {
        try {
            var isSkillActive = false;
            if (new sn_nowassist_admin.NowAssistSkillConfig().isSkillConfigurationActive(CREATE_CATALOG_ITEM_SKILL)) {
                isSkillActive = true;
            }
             if (!isSkillActive) {
                params = {};
                params.action_type = 'skill_enablement_nudge';
                new global.GlobalServiceCatalogUtil().raiseCatalogBuilderAnalyticsUsageEvent(params);
            } 
            hideNudge = isSkillActive;

        } catch (e) {
            params = {};
            params.action_type = 'general_nudge';
            new global.GlobalServiceCatalogUtil().raiseCatalogBuilderAnalyticsUsageEvent(params);
            hideNudge = false;
        }
    } else
        hideNudge = true;

    return hideNudge;
}
