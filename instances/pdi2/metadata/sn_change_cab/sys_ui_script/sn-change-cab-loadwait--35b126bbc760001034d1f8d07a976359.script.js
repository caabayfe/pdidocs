angular.module("sn.change_management.cab.loadWait", ['ui.bootstrap.modal'])
.service("loadWait",["$log", function($log) {
	var loadWait = this;
	
	var loadWaitReg = {};
	var recordNotFound = false;
	
	loadWait.isWaiting = function() {
		return Object.keys(loadWaitReg).length > 0;
	};
	
	loadWait.getWaits = function() {
		return loadWaitReg;
	};
	
	loadWait.register = function(key) {
		loadWaitReg[key] = true;
	};
	
	loadWait.unregister = function(key) {
		delete loadWaitReg[key];
	};
	
	loadWait.clear = function() {
		loadWaitReg = {};
	};

	loadWait.recordNotFound = function() {
		return recordNotFound;
	};

	loadWait.setRecordNotFound = function(value) {
		recordNotFound = value;
	};

}])
.directive("cabLoading", ["loadWait", "$uibModal", "$log", function(loadWait, $uibModal, $log) {
	return {
		"restrict": "A",
		"scope" : {},
		"link": function(scope, element) {
			var modal = null;
			scope.loadWait = loadWait;
			scope.$watch(scope.loadWait.isWaiting, function(newValue) {
				if (modal !== null && newValue === true)
					return;
				
				if (newValue === true) {
					modal = $uibModal.open({
						"animation": false,
						"backdrop": "static",
						"controller": [function() {
							
						}],
						"scope": scope,
						"templateUrl": "cab-loading-dialog"
					});
					return;
				}
				
				if (modal !== null) {
					modal.close();
					modal = null;
				}
			});
		}
	};
}]);
