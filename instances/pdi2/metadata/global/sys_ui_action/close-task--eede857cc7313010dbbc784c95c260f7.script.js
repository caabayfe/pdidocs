var redirectObj = global.AssetUtils.validateMandatoryDetails(current);
if (redirectObj !== undefined && !gs.nil(redirectObj)) {
	action.setRedirectURL(redirectObj);
}
