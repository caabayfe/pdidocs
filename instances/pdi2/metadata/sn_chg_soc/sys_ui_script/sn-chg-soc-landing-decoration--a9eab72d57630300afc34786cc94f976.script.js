angular.module("sn.chg_soc.landing")
.directive("snLandingDecoration", function(getTemplateUrl) {
	"use strict";
	return {
		replace : true,
		restrict : "E",
		templateUrl : getTemplateUrl("sn_chg_soc_landing_decoration.xml")
	};
});
