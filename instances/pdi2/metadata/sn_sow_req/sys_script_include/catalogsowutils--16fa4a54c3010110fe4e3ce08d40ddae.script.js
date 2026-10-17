var CatalogSOWUtils = Class.create();
CatalogSOWUtils.prototype = {
    initialize: function() {
    },
    getRequestedUserInfo : function(requestorRecord) {
      var requestorInfo = {};
      if (!requestorRecord.isValidRecord())
        return requestorInfo;
      
      requestorInfo.avatar = requestorRecord.avatar ? "/" + requestorRecord.avatar + ".iix?t=small" : "";
      if (requestorRecord.time_zone)
        requestorInfo.timeZone = requestorRecord.getDisplayValue("time_zone");
      else
        requestorInfo.timeZone = gs.getProperty('glide.sys.default.tz') || 'America/Los_Angeles';
      requestorInfo.title = requestorRecord.getDisplayValue("title") || "";
      requestorInfo.department = requestorRecord.getDisplayValue("department") || "";

      var locationRef = requestorRecord.location.getRefRecord();
      if (locationRef.isValidRecord())
        requestorInfo.city = locationRef.getDisplayValue("city") || "";
  
      return requestorInfo;
    },
    showPrice: function(price) {
      var priceDisplay = gs.getProperty("glide.sc.price.display", "always");
      if ((priceDisplay == "never") || (priceDisplay == "non_zero" && this.isZero(price)))
        return false;
      return true;
    },
    isZero: function(price) {
      var priceThresholdStr = gs.getProperty("glide.sc.price.precision_threshold", "0.000001");
      var priceThreshold = !isNaN(priceThresholdStr) ? Number(priceThresholdStr) : Number("0.000001");
      return Math.abs(price) <= priceThreshold;
    },
    type: 'CatalogSOWUtils'
};
