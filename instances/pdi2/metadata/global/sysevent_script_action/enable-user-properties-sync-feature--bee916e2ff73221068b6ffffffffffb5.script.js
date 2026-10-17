var logPrefix = "UXA-UserProp: ";
gs.info(logPrefix+"Initiating the user properties feature after system upgraded.");
sn_app_analytics.SNAnalyticsUserProperties.enableAnalyticsUserPropFeatureIfSystemDisabled();
gs.info(logPrefix+"The user properties feature has been enabled after system upgraded.");
