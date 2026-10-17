function transform(input) {
    return {
        isSessionTabsFeatureEnabled: gs.getProperty('sn_oe_sfs.enable_information_session_tabs') == "true"
    };
}
