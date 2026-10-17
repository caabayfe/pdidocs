answer = true;
if (!gs.nil(current.parent)) {
	answer = false;
	if (global.AssetUtils.IS_ITAM_COMMON_ACTIVE && global.AssetUtils.isParentPallet(current.parent.toString())) {
		answer = true;
	}
}
