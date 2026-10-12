(function () {
	'use strict';

	angular.module('sn.itsm.vcab.common')
	.factory('go', ['$window', '$location', 'spUtil', 'CAB', '$uibModal', function ($window, $location, spUtil, CAB, $uibModal) {
		function getPathBase() {
			return spUtil.getHost() + $location.path();
		}

		return {
			toMeetingDashboard: function (meetingId) {
				$window.location.href = getPathBase() + '?id=' + CAB.WORKBENCH + '&sys_id=' + meetingId;
			},
			toFormModal: function(table, sysId, data, templateUrl) {
				var url = "/$cab_workbench_external_url_handler.do?sysparm_clear_stack=true&sysparm_nameofstack=SNC_FORM_MODAL&sysparm_cabw_goto_url=" + encodeURIComponent("/" + table + ".do?sys_id=" + sysId);
				var sessStorage = $window.sessionStorage;
				sessStorage.setItem('cabw_external_redirect_param', 'true');
				if (!data)
					data = {};
				data = angular.extend({
					cabwModalName: "CabwPopupModal"
				}, data);
				data.url = url;
				if (!templateUrl) {
					templateUrl = "/partials/cab_workbench_form_modal.html";
					if (!data.title)
						throw 'Default template requires title attribute in data';
				}
				return $uibModal.open ({
					controller: 'ModalCtrl',
					templateUrl: templateUrl,
					size: 'lg',
					resolve: {
						data: function() {
							return data;
						}
					}
				});
			},
			toTaskFormModal: function(agendaItem) {
				var data = { "task": agendaItem.task.record.sys_class_name.display_value };
				return this.toFormModal(agendaItem.task.record.sys_class_name.value, agendaItem.task.record.sys_id.value, data, 'task_record.html');
			},
		};
	}]);
} ());
