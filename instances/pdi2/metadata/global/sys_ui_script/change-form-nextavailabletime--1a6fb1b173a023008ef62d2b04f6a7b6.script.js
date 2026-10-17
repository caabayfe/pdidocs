var app = angular.module("sn.change_request.form.next_available_time", [
		'sn.common',
		'ui.bootstrap',
		'ui.bootstrap.popover',
		'sn.change_request.next_available_time',
		'sn.itsm.common.accessibility'
	])
	.config(function($locationProvider) {
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});
	});
