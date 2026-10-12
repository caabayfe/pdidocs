angular.module("sn.app_itsm.now.iscroll", [])
.directive("iScroll", ["$rootScope", "$window", "$timeout", function($rootScope, $window, $timeout) {
	return {
		link: function(scope, elem, attrs) {
			var checkWhenEnabled, handler, scrollDistance, scrollEnabled, scrollElem;
			$window = angular.element($window);

			if (attrs.iScrollContainer)
				scrollElem = angular.element(attrs.iScrollContainer);

			scrollDistance = 0;
			if (attrs.iScrollDistance !== null) {
				scope.$watch(attrs.iScrollDistance, function(value) {
					scrollDistance = parseInt(value, 10);
					return scrollDistance;
				});
			}
			scrollEnabled = true;
			checkWhenEnabled = false;
			if (attrs.iScrollDisabled !== null) {
				attrs.$observe("iScrollDisabled", function(value) {
					scrollEnabled = value === "false";
					if (scrollEnabled && checkWhenEnabled) {
						checkWhenEnabled = false;
						return handler();
					}
				});
			}

			var prevImmediateCheck = null;
			attrs.$observe("iScrollImmediateCheck", function(iScrollImmediateCheck) {
				if (prevImmediateCheck !== null || iScrollImmediateCheck === "false") {
					prevImmediateCheck = iScrollImmediateCheck;
					if (iScrollImmediateCheck === "true")
						handler();
				}
			});

			handler = function() {
				var elementBottom, remaining, shouldScroll, windowBottom;
				if (scrollElem)
					windowBottom = scrollElem.height() + scrollElem.scrollTop();
				else
					windowBottom = $window.height() + $window.scrollTop();
				elementBottom = elem.offset().top + elem.height();
				remaining = elementBottom - windowBottom;
				shouldScroll = remaining <= $window.height() * scrollDistance;
				if (shouldScroll && scrollEnabled) {
					if ($rootScope.$$phase)
						return scope.$eval(attrs.iScroll);
					else
						return scope.$apply(attrs.iScroll);
				} else if (shouldScroll) {
					checkWhenEnabled = true;
					return checkWhenEnabled;
				}
			};

			// Attach handler to scroll event
			if (scrollElem)
				scrollElem.on("scroll", handler);
			else
				$window.on("scroll", handler);

			scope.$on("$destroy", function() {
				if (scrollElem)
					return scrollElem.off("scroll", handler);
				return $window.off("scroll", handler);
			});

			return $timeout(function() {
				if (attrs.iScrollImmediateCheck === "true")
					if (scope.$eval(attrs.iScrollImmediateCheck))
						return handler();
					else
						return handler();
			}, 0);
		}
	};
}]);
