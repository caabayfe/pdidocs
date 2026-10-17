angular.module("sn.chg_soc.mousedown", [])
	.directive("socMouseDown", ["$document", "$parse", "$interval", function($document, $parse, $interval) {
		return {
			restrict: 'A',
			link: function ($scope, $element, $attrs, $controller) {
				var intervalPromise = null;
				var touchEnabled = isTouchEnabled();
				var action = $parse($attrs.socMouseDown);
				var freq = parseInt($attrs.socMouseDownFreq, 10);
				freq = isNaN(freq) ? 15 : freq;

				function onStart(event) {
					event.preventDefault();
					performAction();
					intervalPromise = $interval(performAction, freq);
					bindEndProcess();
				}

				function onEnd(event) {
					$interval.cancel(intervalPromise);
					if (touchEnabled)
						$element.off('touchend', onEnd);
					else {
						$element.off('mouseup', onEnd);
						$element.off('mouseleave', onEnd);
					}
				}

				function bindStartProcess() {
					if (touchEnabled)
						$element.on("touchstart", onStart);
					else
						$element.on("mousedown", onStart);
				}

				function bindEndProcess() {
					if (touchEnabled)
						$element.on('touchend', onEnd);
					else {
						$element.on('mouseup', onEnd);
						$element.on('mouseleave', onEnd);
					}
				}

				function performAction() {
					action($scope);
				}

				function isTouchEnabled() {
					return typeof $document[0].body.ontouchstart !== "undefined" &&
						typeof $document[0].body.ontouchend !== "undefined";
				}

				bindStartProcess();
			}
		};
	}]);
