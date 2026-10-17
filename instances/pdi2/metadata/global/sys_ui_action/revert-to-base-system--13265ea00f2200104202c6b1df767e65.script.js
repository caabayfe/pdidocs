action.setRedirectURL(current);
new RevertUpdateVersionAjax().revertToBaseSystem(current.upgrade_detail);
new UpgradeCenterGCFAnalyticsAjax().sendUsageAnalyticsEvent('custom_metric', 'upgrade_summary_task', 'button_click', {'button':'revertToOOB'});
