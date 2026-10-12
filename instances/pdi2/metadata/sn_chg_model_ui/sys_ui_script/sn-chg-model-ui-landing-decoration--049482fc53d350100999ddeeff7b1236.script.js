angular.module("sn.chg_model_ui.landing")
.directive("snLandingDecoration", function($window, urlTools) {
	"use strict";
	return {
		replace : true,
		restrict : "E",
		templateUrl : urlTools.getPartialURL("sn_chg_model_ui_cmu_landing_decoration.xml", "v=" + $window.NOW.macro_flush_stamp)
	};
});
