/* Module for splash screens */
angular.module("sn.chg_model_ui.landing_splash_screens", [])
.directive("snSplashScreens", function($window, urlTools) {
	"use strict";
	return {
		replace: true,
		restrict: "E",
		templateUrl: urlTools.getPartialURL("sn_chg_model_ui_cmu_landing_splash_screens.xml", "v=" + $window.NOW.macro_flush_stamp)
	};
});
