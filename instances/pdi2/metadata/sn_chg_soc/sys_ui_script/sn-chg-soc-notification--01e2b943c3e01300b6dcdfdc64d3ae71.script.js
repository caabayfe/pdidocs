angular.module("sn.chg_soc.notification", [])
	.service("socNotification", ["snNotification", function(snNotification) {
		var socNotification = this;
		var msgContainer = ".control-notif";
		var options = {
			top: 20,
			gap: 10,
			duration: 0
		};

		snNotification.setOptions(options);

		socNotification.show = function(type, message, duration, onClick, container) {
			duration = duration ? duration : options.duration;
			container = container ? container : msgContainer;
			// Maintain a single message at a time.
			socNotification.hide();
			snNotification.show(type, message, duration, onClick, container);
		};

		// Ensures attached handler for the message is invoked; destroys scope, clears timeout, updates snNotification array of messages.
		socNotification.hide = function() {
			angular.element(msgContainer).find(".notification-container .close").click();
		};

		socNotification.setOptions = function(options) {
			snNotification.setOptions(options);
		};
	}]);
