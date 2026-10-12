var tsConfigurationGR = new TSConfigurationUtil().getTSConfigurationRecordForTextIndexName(current.table);
tsConfigurationGR.next();
action.setRedirectURL("ts_configuration.do?sys_id=" + tsConfigurationGR.sys_id);
