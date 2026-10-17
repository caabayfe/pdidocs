(function() {
    data.g_sessionId = gs.getSessionID();
    data.canAccessPerfPageAndLogs = gs.hasRole('log_debugger');
    data.canAccessPerfPageButNotLogs = !gs.hasRole('log_debugger') && (gs.hasRole('sp_admin') || new GlideImpersonate().isImpersonating());
    data.cannotAccessPerfPage = !(data.canAccessPerfPageAndLogs || data.canAccessPerfPageButNotLogs);
    data.i18nMessages = {
        "subscribingSessionMssg": gs.getMessage("Subscribing to Session logs"),
        "reloadingPageMssg": gs.getMessage("Reloading page"),
        "analyzingPageLogsMsg": gs.getMessage("Analyzing Page logs")
    }

    if (input && input.action == "performance_analyzer_triggered") {
        var session = gs.getSession();
        if (input.value)
            session.putProperty("is_analyzer_triggered", true);
        else
            session.clearProperty("is_analyzer_triggered");
    }
})();
