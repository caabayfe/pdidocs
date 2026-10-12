angular.module("sn.change_management.cab", ['sn.common', 'sn.calendar', 'ui.bootstrap.modal', 'sn.change_management.cab.core', 'sn.change_management.cab.initialLoad', 'sn.change_management.cab.agenda', 'sn.change_management.cab.approval', 'sn.change_management.cab.attendees', 'sn.change_management.cab.calendar', 'sn.change_management.cab.runtime_state', 'sn.app_common.timers', 'sn.change_management.cab.loadWait', 'sn.change_management.cab.watcher'])
.run(["getTemplateUrl", "$templateRequest", function(getTemplateUrl, $templateRequest) {
	var t = "&t=" + new Date().getTime();
	$templateRequest(getTemplateUrl('common_cal_dhtmlx_scheduler.xml'), false);
	$templateRequest(getTemplateUrl("vcab_sn_vcab_calendar.xml"), false);
}]);
