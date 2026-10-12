var app = angular.module("sn.chg_soc.landing");
app.directive("snLandingPinnedNotification", function(getTemplateUrl) {
    "use strict";
    return {
      replace : true,
      restrict : "E",
      templateUrl : getTemplateUrl("sn_chg_soc_landing_pinned_notification.xml")
    };
});
	
