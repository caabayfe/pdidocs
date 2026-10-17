angular.module("sn.chg_model_ui.notification", [])
	.service("landingNotification", ["snNotification", function(snNotification) {
		var landingNotification = this;
		var msgContainer = ".control-notif";
		var options = {
			top: 20,
			gap: 10,
			duration: 0
		};

		snNotification.setOptions(options);

		landingNotification.show = function(type, message, duration, onClick, container) {
			duration = duration ? duration : options.duration;
			container = container ? container : msgContainer;
			// Maintain a single message at a time.
			landingNotification.hide();
			snNotification.show(type, message, duration, onClick, container);
		};

		// Ensures attached handler for the message is invoked; destroys scope, clears timeout, updates snNotification array of messages.
		landingNotification.hide = function() {
			angular.element(msgContainer).find(".notification-container .close").click();
		};

		landingNotification.setOptions = function(options) {
			snNotification.setOptions(options);
		};
	}]);
