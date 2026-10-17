var reportId = SNC.UsageAnalyticsScriptUtils.getDSUserReportId(current.sys_id, current.name);
if (gs.nil(reportId))
	gs.addErrorMessage(gs.getMessage("Failed to get report ID"));
else
	gs.setRedirect('sys_report_template.do?jvar_report_id=' + reportId + '&sysparm_nameofstack=license_report');
