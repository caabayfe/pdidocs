angular.module("sn.itsm.common.accessibility", [])
.constant("KEYS", {
	"TABKEY": 9
})
.directive("trapTabFocus", ["KEYS", function (KEYS) {
	return {
		restrict: "A",
		link: function ($scope, $element, $attr) {
			$element.on("keydown", function(event) {
				var keyCode = event.charCode === 0 ? event.keyCode : event.charCode;
				if (keyCode === KEYS.TABKEY) {
					var include = "button:visible, [tabindex]:visible";
					var exclude = "[tabindex='-1'], [disabled='disabled']";
					if ($scope.tabbable && $scope.tabbable.hasOwnProperty("include"))
						include = $scope.tabbable.include;
					if ($scope.tabbable && $scope.tabbable.hasOwnProperty("exclude"))
						exclude = $scope.tabbable.exclude;
					var tabEls = $element.find(include).not(exclude);
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
