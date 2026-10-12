(function() {
    try {
        var naaGlobalUtil = new global.NowAssistAdminGlobalScopedUtil();
        var updateColumn = naaGlobalUtil.updateColumn.bind(naaGlobalUtil);
        updateColumn('sn_ns_provider_configuration_status', 'global_consent', 'read_only', true);
    } catch (e) {
        gs.error("Updating record failed in fix Script " + e.toString());
        return null;
    }


})();
