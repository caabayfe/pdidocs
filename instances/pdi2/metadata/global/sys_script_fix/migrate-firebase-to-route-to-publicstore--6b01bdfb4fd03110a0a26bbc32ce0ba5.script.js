gs.info('Migration of use_firebase_link to route_to_public_store_if_not_installed started');
var mobileAppGr = new GlideRecord("sys_sg_mobile_application");
if (mobileAppGr.isValid()) {
	mobileAppGr.query();
	while (mobileAppGr.next()) {
		gs.info('Migrating ' + mobileAppGr.name);
		if (mobileAppGr.use_firebase_links !== undefined) {
			mobileAppGr.route_to_public_store_if_not_installed = mobileAppGr.use_firebase_links;
			gs.info('Updating ' + mobileAppGr.name);
			mobileAppGr.update();
		}
	}
} else {
	gs.info("sys_sg_mobile_application table does not exist");
}
gs.info('Migration of use_firebase_link to route_to_public_store_if_not_installed completed');
