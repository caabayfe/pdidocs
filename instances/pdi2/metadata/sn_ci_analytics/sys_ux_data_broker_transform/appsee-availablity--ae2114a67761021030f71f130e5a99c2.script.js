function transform(input) {
    var caConfig = new sn_ci_analytics.CAConfig();
    return caConfig.isAppseeAvailable() && caConfig.supportLegacyDashboard();
}
