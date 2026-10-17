function transform(input) {
    var isOpenframeConfigValid = false;

	// check if the sn_openframe is active or not
    if (!GlidePluginManager.isActive('com.sn_openframe')) {
        return { isOpenframeConfigValid: false };
    }

	// check for sn_openframe_user role
    if (!gs.hasRole('sn_openframe_user')) {
        return { isOpenframeConfigValid: false };
    }

	// when both role & plugin conditions exist, determine the openframe configuration
    isOpenframeConfigValid = !gs.nil((new sn_openframe.OpenFrameAjaxUtility()).checkAccessOpenframe().config);

    return {isOpenframeConfigValid: isOpenframeConfigValid};

}
