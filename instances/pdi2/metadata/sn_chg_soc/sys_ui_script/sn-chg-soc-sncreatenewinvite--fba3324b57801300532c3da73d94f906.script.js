angular.module("sn.chg_soc.snCreateNewInvite", ["sn.common"])
	.directive("snCreateNewInvite", function($timeout, getTemplateUrl, i18n) {
		"use strict";

		return {
			restrict: "E",
			templateUrl: getTemplateUrl("sn_chg_soc_sharing_invitation_search.xml"),
			replace: true,
			link: function(scope, elem, attrs, ctrl) {

				scope.focusOnInput = function() {
					$timeout(function() {
						angular.element("#recipient-input").focus().css("cursor", "");
					}, 100);
				};

				scope.scrollRecipientListToBottom = function() {
					$timeout(function() {
						var recipientListElem = angular.element("#recipient-list");
						recipientListElem.scrollTop = recipientListElem.scrollHeight;
						scope.focusOnInput();
					});
				};

				scope.$on("sn.aside.change_soc_side.open_share:opened", scope.focusOnInput);

			},
			controller: function($scope) {
				$scope.messages = {
					"To:": i18n.getMessage("To:"),
					"Remove {0}": i18n.getMessage("Remove {0}")
				};

				$scope.ignoreList = function() {
					return $scope.pendingRecipients.map(function(recipient) {
						return recipient.sys_id;
					}).join(",");
				};

				$scope.selectMember = function(selectedSuggestion) {
					var alreadyAdded = $scope.pendingRecipients.some(function(recipient) {
						return angular.equals(recipient, selectedSuggestion);
					});
					if (!alreadyAdded)
						$scope.pendingRecipients.push(selectedSuggestion);
					$scope.suggestions.query = "";
					$scope.scrollRecipientListToBottom();
				};

				$scope.keyUp = function(event, index, identityDetails, suggestions) {
					if (event && event.keyCode === 40 && suggestions && index < (suggestions.length + 2)) {
						var suggestion = suggestions[index + 1];
						if (suggestion && suggestion.sys_id)
							angular.element("#suggestion-" + suggestion.sys_id).focus();
					}
					else if (event && event.keyCode === 38) {
						if (suggestions && index > 0)
							angular.element("#suggestion-" + suggestions[index - 1].sys_id).focus();
						else
							$scope.focusOnInput();
					}
				};

				$scope.i18n = i18n;

				$scope.removeRecipient = function(event, index) {
					if (event && event.keyCode === 9)
						return;
					$scope.pendingRecipients.splice(index, 1);
					$scope.focusOnInput();
				};

			}
		};
	});
