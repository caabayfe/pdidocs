/* Module for splash screens */
angular.module("sn.chg_model_ui.landing_splash_screens", [])
.directive("snSplashScreens", function(getTemplateUrl) {
	"use strict";
	return {
		replace: true,
		restrict: "E",
		templateUrl: getTemplateUrl("sn_chg_model_ui_cmu_landing_splash_screens.xml")
	};
});
