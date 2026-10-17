function ($scope, $rootScope, spAriaUtil, i18n) {

	if ($scope.data.allowSessions) {
		$rootScope.$on('sp.sessions', function(name, sessions) {
			$scope.sessions = sessions;
		});
	}
	
	var sessionUpdates = {};

	$scope.sessionCount = function() {
		var num = 0;
		var keys = Object.keys($scope.sessions);
		var journalFields = $scope.data.journalFields;
		
		var temp = {};
		var liveMessages = [];
		
		for (var i = 0; i < keys.length; i++) {
			var session = $scope.sessions[keys[i]];
			var canUserReadJournalField = false;
			var status = session.status;
			
			if (status == "")
				continue;
			
			for (var j = 0; j < journalFields.length; j++) {
				if (journalFields[j].field_name === session.field_type) {
					canUserReadJournalField = journalFields[j].can_read;
					break;
				}
			}

			if (status === "typing" && canUserReadJournalField)
				session.statusDisplay = $scope.data.msgs.typing || status;
			else
				session.statusDisplay = $scope.data.msgs.viewing || "viewing";
		
			num++;
			
			// Live message update
			temp[session.user_display_name] = session.statusDisplay;
			
			if (!sessionUpdates[session.user_display_name] || sessionUpdates[session.user_display_name] != session.statusDisplay) {
				if (session.statusDisplay == 'typing')
					liveMessages.push({'message': i18n.format(i18n.getMessage('{0} is typing.'), {'0': session.user_display_name})});
				else
					liveMessages.push({'message': i18n.format(i18n.getMessage('{0} is viewing.'), {'0': session.user_display_name})});
			}
		}
		if (liveMessages.length)
		  spAriaUtil.sendLiveMessage(liveMessages);
		sessionUpdates = temp; // Helps in flushing the removed sessions(users left the record) 
		
		return num;
	}
	
}
