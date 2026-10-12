function transform(input) {

    var miScore = () => new global.MIScore();
    var miUtil = () => new global.MIUtil();

    const methods = {

        activateCategory: (params) => miScore().activateCategory(params.category, params.active),

        getUiLoginAndIntegrationDetail: (params) => miUtil().getUiLoginAndIntegrationDetail(params.machineIdentity),

        getRiskComplianceScore: () => miScore().getRiskComplianceScore(),

        getWsaFalseDetail: (params) => miUtil().getWsaFalseDetail(params.machineIdentity),

        getInactiveAccountDetail: (params) => miUtil().getInactiveAccountDetail(params.machineIdentity),

        getScoreDetailForCategory: (params) => miScore().getScoreDetailForCategory(params.category),

        getIntegrationAccountCount: () => miUtil().getIntegrationAccountCount(),

        getHighPrivilegedUserCount: () => miUtil().getHighPrivilegedUserCount(),

        isRateLimitingDashboardAnnouncementVisible: () => gs.getProperty("identity.mi.rate_limiting_dashboard_announcement_visible"),

        updateRateLimitingDashboardAnnouncementVisibility: () => gs.setProperty("identity.mi.rate_limiting_dashboard_announcement_visible", false)

    };

    return {
        action: input.action,
        response: methods[input.action](input.params)
    };
}
