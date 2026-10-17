// redirect to view report

action.setReturnURL(current);
action.setRedirectURL("sys_report_template.do?jvar_report_id=" + current.sys_id + "&forceNoRedirection=true");
