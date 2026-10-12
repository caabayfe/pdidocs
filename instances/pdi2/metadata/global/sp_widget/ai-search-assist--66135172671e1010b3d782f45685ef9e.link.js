function link($scope, el, attrs, controller) {
		/*
			We can use angular expressions for the below funtionalities. But JAWS is reading angular expressions on live regions.
			so we are manipulating directly DOM.
		*/
		var timerPromise;
		$scope.ariaStatus = '';
		var $timeout = $injector.get('$timeout');
		function updateAriaStatus(msg) {
			var target = $(el).find('#sp_cxs_aisa_aria_status')[0];
			$scope.ariaStatus = msg; 
			target.innerHTML = '<div>' +$('<div>', { text:msg }).html() + '</div>';
		}

		$scope.setAriaStatus = function(msg, delay) {
			delay = delay || 0;
			if(delay == 0 || timerPromise)
				$timeout.cancel(timerPromise);

			(function(val) {
				timerPromise = $timeout(function() {
					timerPromise = undefined;
					updateAriaStatus(val);
				}, delay);
			})(msg);
		};

		$scope.setAriaStatus(scope.c.data.ariaMsgs.noResultsToDisplay);
	}
