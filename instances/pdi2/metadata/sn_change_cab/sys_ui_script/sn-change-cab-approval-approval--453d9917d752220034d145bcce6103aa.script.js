angular.module("sn.change_management.cab.approval")
	.service("approval", ['CAB', 'modelUtil','runtimeState', 'cabWatcher', '$http', '$q', '$rootScope', function(CAB, modelUtil, runtimeState, cabWatcher, $http, $q, $rootScope) {
		var approval = this;
		
		var SYSAPPROVAL_APPROVER = "sysapproval_approver";
		
		var tId = "";
		var aInf = {};
		var defReq;
		//var wChan;
		
		var watcherSubscribed = false;
		
		var rwMod = {
			"sysapproval_approver": null
		};

		function onFail(response) {
			modelUtil.failNicely(response);
			return $q.reject(response);
		}
		
		approval.approve = function(taskId, comment, approvalGroupSysID) {
			return $http.post(CAB.APPROVAL_SERVICE + "approve/" + taskId, {'comment': comment, 'approvalGroupSysID': approvalGroupSysID}).then(null, onFail);
		};

		approval.reject = function(taskId, comment, approvalGroupSysID) {
			return $http.post(CAB.APPROVAL_SERVICE + "reject/" + taskId, {'comment': comment, 'approvalGroupSysID': approvalGroupSysID}).then(null, onFail);
		};
		
		// LIFE CYCLE
		function refreshUserApproval(taskId) {
			return $http.get(CAB.APPROVAL_SERVICE + taskId)
				.then(function(response) {
					modelUtil.patchObject(aInf, response.data.result);
					return $q.resolve(response);
				},
				onFail);
		}
		
		function init(taskId) {
			tId = taskId;
			defReq = $q.defer();
			var deferred = defReq;
			
			if (!watcherSubscribed)
				runtimeState.get()
				.then(function(rts) {
					cabWatcher.watch(rts.cab_meeting.value)
					.subscribe(function(message) {
						if (message.data.table_name !== SYSAPPROVAL_APPROVER)
							return;

						rwMod[SYSAPPROVAL_APPROVER] = message;
						modelUtil.patchObject(aInf, message.data);
					});
					
					watcherSubscribed = true;
				});
			
			refreshUserApproval(taskId)
				.then(function(response) {
					defReq = null;
					deferred.resolve(aInf);
				},
				function(response) {
					//Cleanup on failure.
					for (var prop in aInf)
						if (aInf.hasOwnProperty(prop))
							delete aInf[prop];
				
					defReq = null;
					deferred.reject(response);
				});
			
			return deferred.promise;
		}
		
		approval.get = function(taskId) {
			if (tId == taskId) { // If the same approval info is being requested.
				if (defReq)
					return defReq.promise;

				return $q.resolve(aInf);
			}
			
			return init(taskId);
		};
		
		/**
		 * Returns the Record Watcher modifications object.
		 * Record watcher responses are set against named values to determine when data from record watcher
		 * was received.  Name of the element is the table name of the modified table.
		 */
		approval.getRWMod = function() {
			return rwMod;
		};

	}]);
