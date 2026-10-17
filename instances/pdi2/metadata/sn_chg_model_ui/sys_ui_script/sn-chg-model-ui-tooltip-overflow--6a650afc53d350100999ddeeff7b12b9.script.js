angular.module("sn.chg_model_ui.tooltip_overflow", [])
	.directive("showTooltipOnTextOverflow", [function() {
		return {
			restrict: "A",
			link: function(scope, element, attrs) {
				var elem = element[0];
				scope.$watch(
					function() {
						return elem.scrollWidth;
					},
					function() {
						var firstElem = element[0];
						if (firstElem.offsetWidth < firstElem.scrollWidth || firstElem.offsetHeight < firstElem.scrollHeight)
							attrs.tooltipEnable = "true";
					}
				);
			}
		};
	}]);
