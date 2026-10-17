(function() {
    'use strict';

    angular.module('sn.calendar')
	.service('calendarNotificationService', ['snNotification', function(snNotification) {
		var calendarNotificationService = this;
		var msgContainer = ".notification-container";
		var options = {
			top: 20,
			gap: 10,
			duration: 0
		};
		snNotification.setOptions(options);

		calendarNotificationService.hide = function() {
			angular.element(msgContainer).find(".close").click();
		};
		calendarNotificationService.show = function(message, type) {
			var duration = options.duration;
			var container = msgContainer;
			// Maintain a single message at a time.
			calendarNotificationService.hide();
			snNotification.show(type, message, duration, null, container);
		};
	}]);
}());
