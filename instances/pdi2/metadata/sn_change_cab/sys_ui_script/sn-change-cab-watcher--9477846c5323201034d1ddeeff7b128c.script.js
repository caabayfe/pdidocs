angular.module("sn.change_management.cab.watcher", ['ng.amb'])
.service("cabWatcher",["$rootScope", "amb", "$timeout", function($rootScope, amb, $timeout) {
	var cabWatcher = this;  //Convenience
	
	var ambChannel = null;
	var mId = null;
	var cbFunc = [];
	
	
	function subscribeCallback(callbackFunc) {
		if (callbackFunc && typeof callbackFunc === "function")
			cbFunc.push(callbackFunc);
	}
	
	function unsubscribeCallback(callbackFunc) {
		var funcIdx = cbFunc.indexOf(callbackFunc);
		
		if (funcIdx !== -1)
			cbFunc.splice(funcIdx,1);
	}	
	
	function executeCallbacks(response) {
		cbFunc.forEach(function(callbackFunc) {
			callbackFunc(response);
		});
	}
	
	function initChannel(meetingSysId) {
		ambChannel = amb.getChannel("/cab/" + meetingSysId);
		ambChannel.subscribe(executeCallbacks);
		amb.connect();
		
		subscribeCallback(function (message) {
			$rootScope.$broadcast("cab.state.change", message.data);
		});
		
		return meetingSysId;
	}
	
	function clearChannel() {
		mId = null;
		ambChannel.unsubscribe();
		ambChannel = null;
	}
	
	cabWatcher.watch = function(meetingSysId) {
		if (!meetingSysId)
			return null;
		
		if (mId !== null && meetingSysId !== mId)
			clearChannel();
		
		if (mId === null)
			mId = initChannel(meetingSysId);
		
		return {
			"subscribe": subscribeCallback,
			"unsubscribe": unsubscribeCallback
		};
	};
}]);
