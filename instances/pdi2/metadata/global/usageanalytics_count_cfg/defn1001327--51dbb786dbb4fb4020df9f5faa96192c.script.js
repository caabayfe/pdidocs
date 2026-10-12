if (typeof SNC.UsageAnalyticsScriptUtils.canRouteToEMS == 'function' && SNC.UsageAnalyticsScriptUtils.canRouteToEMS())
    answer = new IHUsageTrackerUtil().generateIHUsageCount(); //SMv2
else
    answer = SNC.UsageAnalyticsScriptUtils.createIHLicensingDefnInfo(); //SMv1
