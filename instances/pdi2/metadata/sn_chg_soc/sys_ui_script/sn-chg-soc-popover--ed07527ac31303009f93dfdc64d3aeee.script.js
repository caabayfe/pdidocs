angular.module("sn.chg_soc.popover", [])
	.directive("snPopoverAccessibilityFocus", ["$parse", "SOC", function ($parse, SOC) {
		return {
			restrict: 'A',
			link: function ($scope, $element, $attr) {
				$element.on('keydown', function(evt) {
					if (evt.keyCode === SOC.KEYS.TABKEY) {
						var popover = angular.element(this);
						var list = popover.find('button, div[tabindex]').not('[tabindex="-1"]');
						var focused = angular.element(document.activeElement);
						var nav = focused.parents('[sn-popover-accessibility-focus]');
						if (nav.length) {
							evt.preventDefault();
							var index;
							var next;
							if (typeof index == "undefined")
								index = list.index(focused);
							if (!evt.shiftKey)
								index = (index == list.length - 1) ? 0 : index + 1;
							else if (evt.shiftKey)
								index = (index == 0) ? list.length - 1: index - 1;
							next = list.get(index);
							if (next)
								next.focus();
						}
					}
					if (evt.keyCode === SOC.KEYS.ESCAPE) {
						angular.element(".popover").popover("destroy");
						angular.element("[soc-popover]").focus();
						angular.element("[soc-popover]").attr("aria-expanded", "false");
						angular.element("[soc-popover]").removeAttr("soc-popover");
					}
				});
			}
		};
	}]);
