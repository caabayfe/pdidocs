angular.module("sn.chg_model_ui.landing")
	.directive("snLandingCard", function(urlTools, $window) {
		"use strict";
		return {
			replace: true,
			restrict: "E",
			templateUrl: urlTools.getPartialURL("sn_chg_model_ui_cmu_landing_card.xml", "v=" + $window.NOW.macro_flush_stamp),
			controller: function($scope) {
				$scope.createChangeRequest = function(link) {
					if ($scope.chgModelLandingCtrl.isCardClicked())
						return;

					$scope.chgModelLandingCtrl.setCardClicked();

					var urlParams = [];

					var nowUrlParams = window.NOW.chg_model_landing.url_params;

					Object.keys(nowUrlParams).forEach(function(key) {
						var value = nowUrlParams[key];
						if (!value)
							return;

						//Special cases for url encoding in a param
						if (key === "sysparm_stack" || key === "sysparm_referring_url") {
							//Decode until fully decoded to prevent multiple encoding
							while (value !== decodeURIComponent(value)) {
								value = decodeURIComponent(value);
							}
							value = encodeURIComponent(value);
						}

						urlParams.push(key + "=" + value);
					});

					//Build the sysparm_stack if there isn't one.
					if (!nowUrlParams["sysparm_stack"])
						if (nowUrlParams["sysparm_collection"] && nowUrlParams["sysparm_collectionID"])
							urlParams.push("sysparm_stack=" + encodeURIComponent(nowUrlParams["sysparm_collection"] + ".do?sys_id=" + nowUrlParams["sysparm_collectionID"]));

					$window.location.href = link + (urlParams.length > 0 ? "&" + urlParams.join("&") : "");

				};
			}
		};
	});
