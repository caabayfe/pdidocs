//updating the allocated/used field with the latest calculated value.
var licDetailGR = new GlideRecord("license_details");
licDetailGR.addActiveQuery();
licDetailGR.addQuery("license_type", [1, 2]); // capacity or max-user
licDetailGR.query();
var subUtil = new SNSubscriptionUtils();
while (licDetailGR.next()) {
    subUtil.syncSubscriptionUsageCounts(licDetailGR);
}
