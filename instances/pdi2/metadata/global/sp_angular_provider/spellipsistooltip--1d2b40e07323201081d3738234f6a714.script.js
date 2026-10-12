//usage : <XYZ sp-ellipsis-tooltip sp-ellipsis-tooltip-title="" sp-ellipsis-tooltip-data-toggle="" sp-ellipsis-tooltip-data-placement="" sp-ellipsis-tooltip-data-container="" />
//Default : sp-ellipsis-tooltip-title -> '' sp-ellipsis-tooltip-data-toggle -> 'tooltip' sp-ellipsis-tooltip-data-placement -> 'auto' sp-ellipsis-tooltip-data-container -> 'body' 
function spEllipsisTooltip(i18n, $rootScope) {
	"use strict";
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			angular.element(document).ready(function() {
				setTimeout(function() {
                   showTooltip(elem, attrs);
                }, 100);
			});

			function showTooltip (element, attrs) {
				if (element && element.length > 0) {
					if (isEllipsisActive(element.get(0)))
						var title = attrs.spEllipsisTooltipTitle ? attrs.spEllipsisTooltipTitle : '';
						var dataToggle = attrs.spEllipsisTooltipDataToggle ? attrs.spEllipsisTooltipDataToggle : 'tooltip';
						var dataPlacement = attrs.spEllipsisTooltipDataPlacement ? attrs.spEllipsisTooltipDataPlacement : 'auto';
						var dataContainer = attrs.spEllipsisTooltipDataContainer ? attrs.spEllipsisTooltipDataContainer : 'body';

						element.attr('title', title);
						element.attr('data-toggle', dataToggle);
						element.attr('data-placement', dataPlacement);
						element.attr('data-container', dataContainer);
					}
				}

			function isEllipsisActive (element) {
				return element.clientWidth < element.scrollWidth;
			}
		}
	};
}
