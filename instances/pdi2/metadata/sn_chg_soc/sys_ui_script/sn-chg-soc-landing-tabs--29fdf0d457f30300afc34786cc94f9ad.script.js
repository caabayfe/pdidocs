var app = angular.module("sn.chg_soc.landing");
app.directive("snLandingTabs", function(getTemplateUrl) {
    "use strict";
    return {
      replace : true,
      restrict : "E",
      templateUrl : getTemplateUrl("sn_chg_soc_landing_tabs.xml")
    };
});
