(function executeRule(current, previous /*null when async*/ ) {
        g_scratchpad.warningLogCount = 0;
        var grVersion = new GlideRecord("promin_model_def_version"); // get Latest version record
        grVersion.addQuery("project", current.getUniqueValue());
        grVersion.orderByDesc("sys_updated_on");
        grVersion.query();
        if (grVersion.next()) {
            var gaLog = new GlideAggregate('promin_log');
            gaLog.addAggregate('COUNT');
            gaLog.addQuery("project", current.getUniqueValue());
            gaLog.addQuery("model_def_version", grVersion.getUniqueValue());
            gaLog.addQuery("level", "1");
            gaLog.query();
            if (gaLog.next()) {
                g_scratchpad.warningLogCount = parseInt(gaLog.getAggregate('COUNT'), 10);
                g_scratchpad.warningLogsLink =
                    "/promin_log_list.do?sysparm_query=project=" + current.getUniqueValue() + "^model_def_version=" + grVersion.getUniqueValue() + "^level=1";
            }
        }

    })(current, previous);
