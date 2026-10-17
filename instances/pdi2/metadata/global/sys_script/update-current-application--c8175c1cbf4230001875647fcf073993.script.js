updateCurrentApplication();

		function updateCurrentApplication() {
			//send event to update the application picker
			var n = new UINotification('application_change');
			n.setAttribute('update_only', 'true');
			n.send();
		}
