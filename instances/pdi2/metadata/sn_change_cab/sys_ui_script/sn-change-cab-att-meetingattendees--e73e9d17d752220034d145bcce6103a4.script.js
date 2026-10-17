angular.module("sn.change_management.cab.attendees")
	.service("meetingAttendees", ['CAB', 'modelUtil', 'initialLoad', 'runtimeState', 'snPresence', 'cabWatcher', '$rootScope', '$http', '$q', function(CAB, modelUtil, initialLoad, runtimeState, snPresence, cabWatcher, $rootScope, $http, $q) {
		var meetingAttendees = this;
			
		var mId = null;
		var defReq = null;
		var presenceListener = null;
		var attendees = [];
		var inAttendance = [];
		
		function subscribeWatcher() {
			cabWatcher.watch(mId)
			.subscribe(function(message) {
				$rootScope.$applyAsync(function(scope) {
					if (message.data.table_name !== CAB.ATTENDEE)
						return;

					if (message.data.operation === "insert") {
						var attendeeSysId = message.data.record.attendee.value;
						if (attendeeSysId && attendees.indexOf(attendeeSysId) === -1) {
							attendees.push(attendeeSysId);
							inAttendance.push(attendeeSysId);
						}
					}
				});
			});
		}

		function subscribePresence() {
			if (presenceListener)
				presenceListener();
			
			presenceListener = $rootScope.$on("sn.presence", function(event, presenceArray) {
				if (!presenceArray || presenceArray.length === 0)
					return;
				
				presenceArray.forEach(function(presenceItem) {
					if (presenceItem.status === "online") {
						var attendeeIdx = attendees.indexOf(presenceItem.user);
						if (attendeeIdx !== -1 && inAttendance.indexOf(presenceItem.user) === -1)
							inAttendance.push(attendees[attendeeIdx]);
					}
				});
			});
			
			snPresence.init();
		} 
		
		function init(meetingId) {
			mId = meetingId;
			defReq = runtimeState.get(meetingId)
			.then(function(rs) {
				return initialLoad.attendee(meetingId);
			})
			.then(
				function(response) {
					attendees = response.data.result;
					subscribeWatcher();
					subscribePresence();
					defReq = null;
					return attendees;
				},
				function(response) {
					modelUtil.failNicely(response);
					defReq = null;
					return $q.reject(response);
				}
			);
			return defReq.promise;
		}
		
		meetingAttendees.get = function(meetingId) {
			if (mId === meetingId) { // If the same attendee info is being requested.
				if (defReq)
					return defReq.promise;

				return $q.resolve(attendees);
			}
			return init(meetingId);
		};
		
		// Number of people currently attending the meeting
		meetingAttendees.attendanceCount = function() {
			return inAttendance.length;
		};
		
		meetingAttendees.userJoinedMeeting = function(userId) {
			if (!userId || !mId)
				return $q.reject("User sys_id and meeting sys_id required");

			return $http.get(CAB.SERVICE.ATTENDEE + "joinedmeeting/" + mId + "/" + userId)
			.then(
				null,
				function(response) {
					modelUtil.failNicely(response);
					return $q.reject(response);
				}
			);
		};
		
		// Search Attendees
		meetingAttendees.search = function(freetextQuery) {
			if (!mId)
				return $q.reject("Meeing sys_id is required");
			
			freetextQuery = encodeURIComponent(freetextQuery);
			
			return $http.get(CAB.SERVICE.ATTENDEE + mId + "/search/" + freetextQuery)
			.then (
				function(response) {
					return response.data.result;
				},
				function(response) {
					modelUtil.failNicely(response);
					return $q.reject(response);
				}
			);
		};
		
		meetingAttendees.cleanup = function() {
			if (presenceListener)
				presenceListener();
		};
		
	}]);
