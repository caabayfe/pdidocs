angular.module("sn.chg_soc.keyboard", ["sn.common"])
	.directive("socAsideKeyboard", ["getTemplateUrl", "ganttChart", "dataService", "objectKeysLengthFilter", "SOC", "i18n", function(getTemplateUrl, ganttChart, dataService, objectKeysLengthFilter, SOC, i18n) {
		"use strict";
		return {
			restrict: "A",
			templateUrl: getTemplateUrl("sn_chg_soc_aside_keyboard_body.xml"),
			scope: {
				socDefId: "="
			},
			controller: function($scope, objectKeysLengthFilter) {
				$scope.objectKeysLengthFilter = objectKeysLengthFilter;
				$scope.keyboardShortcuts = [
					{
						label: i18n.getMessage("global"),
						shortcuts: [
							{
								label: i18n.getMessage("shift + /"),
								desc: i18n.getMessage("Open or close Keyboard shortcuts panel"),
								screen_reader: i18n.getMessage("Press shift and forward slash"),
								template: ""
							},
							{
								label: i18n.getMessage("tab"),
								desc: i18n.getMessage("Put focus on scheduler"),
								screen_reader: i18n.getMessage("Press tab"),
								template: ""
							},
							{
								label: i18n.getMessage("esc"),
								desc: i18n.getMessage("Close popovers"),
								screen_reader: i18n.getMessage("Press escape"),
								template: ""
							}
						]
					},
					{
						label: i18n.getMessage("scheduler"),
						shortcuts: [
							{
								label: "",
								desc: i18n.getMessage("Scroll horizontally"),
								screen_reader: i18n.getMessage("Press and hold alt and left or right keys"),
								template: i18n.getMessage("alt +") + " <span class='icon icon-arrow-left'></span> / <span class='icon icon-arrow-right'></span>"
							},
							{
								label: "",
								desc: i18n.getMessage("Scroll vertically"),
								screen_reader: i18n.getMessage("Press and hold alt and up or down keys"),
								template: i18n.getMessage("alt +") + " <span class='icon icon-arrow-up'></span> / <span class='icon icon-arrow-down'></span>"
							},
							{
								label: "",
								desc: i18n.getMessage("Scroll by record"),
								screen_reader: i18n.getMessage("Press up and down keys"),
								template: "<span class='icon icon-arrow-up'></span> / <span class='icon icon-arrow-down'></span>"
							},
							{
								label: "",
								desc: i18n.getMessage("Show/hide child records"),
								screen_reader: i18n.getMessage("Press shift and right or left keys"),
								template: i18n.getMessage("shift +") + " <span class='icon icon-arrow-right'></span> / <span class='icon icon-arrow-left'></span>"
							},
							{
								label: i18n.getMessage("space"),
								desc: i18n.getMessage("Select record"),
								screen_reader: i18n.getMessage("Press space"),
								template: ""
							},
							{
								label: i18n.getMessage("enter"),
								desc: i18n.getMessage("Open more information popover for record"),
								screen_reader: i18n.getMessage("Press enter"),
								template: ""
							}
						]
					}
				];
			}
		};
	}]);
