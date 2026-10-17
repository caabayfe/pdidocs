var isV2 = gs.getProperty('glide.services.dish_v2');
if (isV2 == 'true') {
	SNC.GlideServiceEndpointUpdater.process();
} else {
	new SNC.GlideServiceStatus().checkAllServicesStatus();
}
