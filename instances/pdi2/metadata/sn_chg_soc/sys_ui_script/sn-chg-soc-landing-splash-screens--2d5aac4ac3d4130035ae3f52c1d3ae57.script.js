/* Module for splash screens */
angular.module("sn.chg_soc.landing_splash_screens", [])
.directive("snSplashScreens", function(getTemplateUrl) {
	"use strict";
	return {
		replace: true,
		restrict: "E",
		templateUrl: getTemplateUrl("sn_chg_soc_landing_splash_screens.xml")
	};
});
