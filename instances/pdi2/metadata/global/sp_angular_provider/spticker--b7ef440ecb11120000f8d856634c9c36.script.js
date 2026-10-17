function($interval, $timeout) {

	return {

		restrict: 'A',
		scope: true,
		compile: function() {

			return function(scope, element, attributes) {

				var timing,
					timingEffect,
					timingEffectDivideBy = 4,
					start,
					direction;

				if (attributes.direction=='up' || attributes.direction=='down') {
					direction = attributes.direction;
				} else {
					direction = 'up';
				}

				if (attributes.timing) {
					timing = attributes.timing;
					timingEffect = timing / timingEffectDivideBy;
				} else {
					timing = 5000;
					timingEffect = timing / timingEffectDivideBy / timingEffectDivideBy * 2;
				}

				function startInterval(element) {

					var list = element,
						items = element.find('a'),
						itemFirst,
						itemLast;

					if (items.length) {
						list.addClass('active');

						start = $interval(function() {

							items = list.children('a');

							if (direction=='up') {
								itemFirst = angular.element(items[0]);
								itemFirst.addClass('fade-out minus-margin-top');
								$timeout(function() {
									itemFirst.removeClass('minus-margin-top');
									list.append(itemFirst);
									$timeout(function() {
										items.removeClass('fade-out');
									}, timingEffect);

								}, timingEffect);
							} else {
								itemLast = angular.element(items[items.length -1]);
								itemLast.addClass('fade-out');
								$timeout(function() {
									itemLast.addClass('minus-margin-top');
									itemLast.removeClass('fade-out');
									list.prepend(itemLast);							
									$timeout(function() {
										items.removeClass('minus-margin-top');
									}, timingEffect);
								}, timingEffect);
							} 

						}, timing);
					} else {
						console.warn('no items assigned to ticker!');
					}

				}		

				scope.$watch(element, function() {
					startInterval(element);
				});

				element.on('$destroy', function() {
					$interval.cancel(start, 0);
				});

				element.on('mouseover', function() {
					$interval.cancel(start, 0);
				});

				element.on('mouseout', function() {
					startInterval(element);
				});

			};
		}

	};
};
