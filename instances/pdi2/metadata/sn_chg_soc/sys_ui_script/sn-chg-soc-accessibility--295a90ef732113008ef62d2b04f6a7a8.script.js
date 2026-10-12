angular.module("sn.chg_soc.accessibility", [])
	.directive("focusHere", ["$timeout", function ($timeout) {
		return {
			restrict: "A",
			link: function ($scope, $element, $attr) {
				$timeout(function(){
					$element[0].focus();
				}, 0);
			},
			controller: function ($scope) {
				$scope.$on("sn.aside.change_soc_side.open", function() {
					var firstTabbable = angular.element("[focus-here='']");
					if (firstTabbable.length)
						firstTabbable.focus();
				});
			}
		};
	}])
	.directive("trapTabFocus", ["SOC", function (SOC) {
		return {
			restrict: "A",
			link: function ($scope, $element, $attr) {
				$element.on("keydown", function(event) {
					if (event.keyCode === SOC.KEYS.TABKEY) {
						var tabEls = $element.find(":tabbable");
						var firstEl = tabEls.first();
						var lastEl = tabEls.last();
						// tab and last element then focus on first element
						if (!event.shiftKey && event.target === lastEl[0]) {
							event.preventDefault();
							firstEl.focus();
						}
						// shift+tab and first element then focus on last element
						if (event.shiftKey && event.target === firstEl[0]) {
							event.preventDefault();
							lastEl.focus();
						}
					}
				});
			}
		};
	}]);
