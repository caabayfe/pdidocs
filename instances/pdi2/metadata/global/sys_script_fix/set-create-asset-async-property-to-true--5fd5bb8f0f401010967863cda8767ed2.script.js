var ASSET_ASYNC_PROPERTY = 'glide.create_alm_asset.async';
if (pm.isZboot()) {
	gs.setProperty(ASSET_ASYNC_PROPERTY, 'true');
}
