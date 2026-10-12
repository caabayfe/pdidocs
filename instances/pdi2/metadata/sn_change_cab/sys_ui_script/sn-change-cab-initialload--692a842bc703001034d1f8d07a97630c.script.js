angular.module("sn.change_management.cab.initialLoad", [])
.service("initialLoad",["CAB", "$http", "$q", "modelUtil", "loadWait", function(CAB, $http, $q, modelUtil, loadWait) {
	var initialLoad = this;
	
	var cache = null; // structure {runtime_state: {}, agenda: {}, attendee: []}
	var dReq = null;
	
	function refreshData (meetingId) {
		if (dReq)
			return dReq.promise;
		
		var dReq = $q.defer();
		
		$http.get(CAB.SERVICE.INITIAL + meetingId)
		.then(
			function(response) {
				dReq.resolve(response.data.result);
				dReq = null;
				cache = response.data.result;
			},
			function(response) {
				dReq.reject(response);
				loadWait.setRecordNotFound(true);
				dReq = null;
				cache = null;
			}
		);
		
		return dReq.promise;
	}
	
	initialLoad.runtimeState = function(meetingId) {
		if (cache !== null)
			return $q.resolve({"data": {"result": cache.runtime_state}});
		
		return refreshData(meetingId)
		.then(
			function(response) {
				return {"data": {"result": response.runtime_state}};
			},
			function(response) {
				return $q.reject(response);
			}
		);
	};
	
	initialLoad.agenda = function(meetingId) {
		if (cache !== null)
			return $q.resolve({"data": {"result": cache.agenda}});
		
		return refreshData(meetingId)
		.then(
			function(response) {
				return {"data": {"result": response.agenda}};
			},
			function(response) {
				return $q.reject(response);
			}
		);
	};
	
	initialLoad.attendee = function(meetingId) {		
		if (cache !== null)
			return $q.resolve({"data": {"result": cache.attendee}});
		
		return refreshData(meetingId)
		.then(
			function(response) {
				return {"data": {"result": response.attendee}};
			},
			function(response) {
				return $q.reject(response);
			}
		);
	};
}]);
