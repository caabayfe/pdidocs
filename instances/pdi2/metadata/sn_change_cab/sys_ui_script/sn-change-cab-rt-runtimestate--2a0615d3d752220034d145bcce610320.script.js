angular.module("sn.change_management.cab.runtime_state")
	.service("runtimeState", ['CAB', 'modelUtil', 'initialLoad', '$http', '$q', '$rootScope', 'cabWatcher', function(CAB, modelUtil, initialLoad, $http, $q, $rootScope, cabWatcher) {			
		var runtimeState = this;  // For convenience
		var rSt = {'localState': {}}; // Runtime state
		var mId = null; // Meeting Id
		var mIdReq = null; // Requested meeting ID
		var defReq = null; //Deferred request
		
		// The latest modification from Record Watcher
		var rwMod = {
			"cab_runtime_state": null,
			"cab_meeting": null
		};

		// Builds the state from the REST service return
		function buildState(response) {
			
			// Clear the object without breaking references
			for (var key in rSt)
				if (rSt.hasOwnProperty(key))
					delete(rSt[key]);
			
			rSt.localState = {};
			
			modelUtil.patchObject(rSt, response.data.result);
			// Add MS values for all dates in the nested CAB Meeting record
			modelUtil.addValueMSToAll(rSt.cab_meeting.record);
			modelUtil.glideListToArray(rSt.cab_meeting.record.delegates);
			
			rSt.localState.time_offset = Date.now() - rSt.request_time_ms;
			
			mId = rSt.cab_meeting.value;
			
			cabWatcher
				.watch(mId)
				.subscribe(function(message) {
					var dataTable = message.data.table_name;
					if (dataTable === CAB.RUNTIME_STATE) {
						$rootScope.$applyAsync(function(scope) {
							modelUtil.patchObject(rSt, message.data.record);
							rwMod[CAB.RUNTIME_STATE] = message;
						});
					}
					if (dataTable === CAB.MEETING) {
						$rootScope.$applyAsync(function(scope) {
							if (!rSt.cab_meeting.record)
								rSt.cab_meeting.record = {};
					
							modelUtil.patchObject(rSt.cab_meeting.record, message.data.record);
							modelUtil.glideListToArray(rSt.cab_meeting.record.delegates);
							rwMod[CAB.MEETING] = message;
						});
					}
				});
		}
		
		// API
		/**
		 * Sets the current agenda item for the meeting. Patches the runtime
		 * state if amb is not turned on
		 */
		runtimeState.nextAgendaItem = function(nextAgendaItemId) {
			if (nextAgendaItemId && !modelUtil.isValidSysID(nextAgendaItemId))
				return $q.reject("Invalid Agenda Item Id");

			return $http.get(CAB.SERVICE.RUNTIME+ "next_item/" + mId + "/" + nextAgendaItemId)
				.then(null, modelUtil.failNicely);
		};

		runtimeState.demoteCurrentNextAgendaItem = function(nextAgendaItemId) {
			if (nextAgendaItemId && !modelUtil.isValidSysID(nextAgendaItemId))
				return $q.reject("Invalid Agenda Item Id");
			
			return $http.get(CAB.SERVICE.RUNTIME+ "demote_current_item/" + mId + "/" + nextAgendaItemId)
				.then(null, modelUtil.failNicely);
		};

		runtimeState.noDecisionNextAgendaItem = function(nextAgendaItemId) {
			if (nextAgendaItemId && !modelUtil.isValidSysID(nextAgendaItemId))
				return $q.reject("Invalid Agenda Item Id");

			return $http.get(CAB.SERVICE.RUNTIME+ "nd_next_item/" + mId + "/" + nextAgendaItemId)
				.then(null, modelUtil.failNicely);
		};
			
		runtimeState.pauseCurrentAgendaItem = function() {
			return $http.get(CAB.SERVICE.RUNTIME+ "pause_current_item/" + mId)
				.then(null, modelUtil.failNicely);
		};
		
		runtimeState.resumeCurrentAgendaItem = function() {
			return $http.get(CAB.SERVICE.RUNTIME+ "resume_current_item/" + mId)
				.then(null, modelUtil.failNicely);
		};

		/**
		 * If the user is following the current agenda item
		 */
		runtimeState.isViewingCurrent = function() {
			if (rSt.localState && rSt.localState.viewing && rSt.current_agenda_item)
				return rSt.localState.viewing == rSt.current_agenda_item.value;
			return true;
		};

		/**
		 * Starts the meeting and selects next pending agenda as current agenda
		 */
		runtimeState.startMeetingAndSelectNextAgenda = function() {
			if (!mId)
				$q.reject("No meeting Id");

			return runtimeState.startMeeting();
		};

		/**
		 * Set the agenda item the user is following
		 */
		runtimeState.setViewAgendaItem = function(agendaItemId) {
			$rootScope.$applyAsync(function() {
				rSt.localState.viewing = agendaItemId;
			});
		};
			
		/**
		 * Returns the id if the agenda item being viewed
		 */
		runtimeState.getViewAgendaItem = function() {
			if (rSt.localState && rSt.localState.viewing)
				return rSt.localState.viewing;
			
			if (rSt.current_agenda_item)
				return rSt.current_agenda_item.value;
		};
			
		/**
		 * Returns true if the given user is the cab manager
		 */
		runtimeState.isCABManager = function(userSysId) {
			if (rSt.host && rSt.host.value) 
				return rSt.host.value === userSysId;

			if (rSt.cab_meeting && rSt.cab_meeting.record)
				return rSt.cab_meeting.record.manager.value === userSysId;

			return false;
		};
		
		runtimeState.isHost = function(userSysId) {
			if (rSt.host && rSt.host.value)
				return rSt.host.value === userSysId;

			return false;
		};

		/**
		 * Return true if the given user id is a delegate.
		 */
		runtimeState.isCABManagerDelegate = function(userSysId) {
			if (!(rSt.cab_meeting && rSt.cab_meeting.record))
				return false;
			
			// If they're the CAB Manager, the're always a delegate
			if (rSt.cab_meeting.record.manager.value == userSysId)
				return true;
			
			// If they're one of the delegates, they're a delegate
			if (rSt.cab_meeting.record.delegates.value.indexOf(userSysId) > -1)
				return true;
			
			return false;
		};
		
		/**
		 * Returns true if the given user is current notes editor
		 */
		runtimeState.isNotesEditor = function(userSysId) {
			if (rSt.notes_editor && rSt.notes_editor.value)
				return rSt.notes_editor.value === userSysId;

			return false;
		};

		runtimeState.canEditNotes = function(userSysId){
			return (runtimeState.isCABManager(userSysId) || runtimeState.isCABManagerDelegate(userSysId))
					&& rSt.notes_editor.value === userSysId;
		};

		runtimeState.setNotesEditor = function(useId){
			return $http.post(CAB.SERVICE.NOTES_EDITOR + mId, { notesEditor: useId });
		};

		/**
		 * Starts the meeting if it's not already in progress
		 */
		runtimeState.startMeeting = function() {
			if (rSt.cab_meeting && rSt.cab_meeting.record && rSt.cab_meeting.record.state.value == CAB.PENDING)
				return $http.get(CAB.SERVICE.RUNTIME+ "start/" + mId).then(null, modelUtil.failNicely);
			
			return $q.reject();
		};
		

		runtimeState.hostMeeting = function(newHostId){
			if (!(mId && rSt.cab_meeting)) //If the meeting is not set up don't allow host change
				return $q.reject();
			
			return $http.post(CAB.SERVICE.HOST_MEETING + mId, { newHost: newHostId }).then(null, modelUtil.failNicely);
		};
		
		/**
		 * Ends the meeting if it's in progress
		 */
		runtimeState.endMeeting = function() {
			if (rSt.cab_meeting && rSt.cab_meeting.record && rSt.cab_meeting.record.state.value == CAB.IN_PROGRESS)
				return $http.get(CAB.SERVICE.RUNTIME+ "end/" + mId).then(null, modelUtil.failNicely);
			
			return $q.reject();
		};
		
		// LIFE CYCLE ----------
		/**
		 * Cleanup the service.
		 */
		runtimeState.cleanup = function() {
			if (wChan)
				wChan.unsubscribe();
			
			if (wMtgChan)
				wMtgChan.unsubscribe();
			
			for (var key in rSt)
				if (rSt.hasOwnProperty(key))
					delete(rSt[key]);
				
			rSt.localState = {};
		};
			
		/**
		 * Initialise the meeting state. Leaves the meeting state in it's
		 * original state if it fails.
		 */
		function init(meetingSysId) {
			if (!meetingSysId || !modelUtil.isValidSysID(meetingSysId))
				return $q.reject("Invalid meetingId");
			
			// Request setup
			mIdReq = meetingSysId;  //requested meeting id
			var deferred = defReq || $q.defer();  //Check for placeholder deferred request
			defReq = deferred;
			
			initialLoad.runtimeState(meetingSysId)
			.then(
				function(response){
					buildState(response);
					mIdReq = null;
					defReq = null;
					deferred.resolve(rSt);
				}, 
				function(response) {
					modelUtil.failNicely(response);
					mIdReq = null;
					defReq = null;
					deferred.reject(response);
				}
			);
			return deferred.promise;
		}
		
		/**
		 * Refreshes the current meeting state using the REST service
		 */
		runtimeState.refresh = function() {
			var deferred = $q.defer();
			$http.get(CAB.SERVICE.RUNTIME + this.mId)
			.then(
				function(response) {
					modelUtil.patchObject(rSt, response.data.result);
					modelUtil.addMSValueToAll(rSt.cab_meeting.record);
					deferred.resolve(rSt);
				},
				function(response) {
					modelUtil.failNicely(response);
					deferred.reject(response);
				}
			);
			return deferred.promise;
		};
		
		/**
		 * Get the meeting state for the given sys id. Returns the current state
		 * if the meetingId matches, initialises against the new id if not.
		 */
		runtimeState.get = function(meetingSysId) {
			// If there's nothing to go on, wait until there is
			if (!meetingSysId && !mId && !defReq) {
				defReq = $q.defer();
				return defReq.promise;
			}

			// If no meeting has been requested but we're waiting until we have a meeting id.
			if (!meetingSysId && !mIdReq && defReq)
				return defReq.promise;
			
			// If meeting info has been requested
			if ((!meetingSysId || meetingSysId === mIdReq) && defReq)
				return defReq.promise;
			
			// If we already have the meeting info
			if ((meetingSysId === mId) || (!meetingSysId && mId))
				return $q.resolve(rSt);
			
			// Init if we have a meeting id
			if (meetingSysId)
				return init(meetingSysId);
			
			// Default reject
			return $q.reject();
		};

		/**
		 * Returns the Record Watcher modifications object.
		 * Record watcher responses are set against named values to determine when data from record watcher
		 * was received.  Name of the trigger is usually the table name of the modified table.
		 */
		runtimeState.getRWMod = function() {
			return rwMod;
		};
		
	}]);
