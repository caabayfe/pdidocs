var MobileThemeRefQualifier = Class.create();
MobileThemeRefQualifier.prototype = {
    getRefQualifier: function() {
		var mobileThemeSysIds = new sn_mobile_theme.MobileThemeColorAPI().getMobileThemeIds();
		if (gs.nil(mobileThemeSysIds))
			return "sys_id=";
		
		return "sys_idIN" + mobileThemeSysIds;
	},
    type: 'MobileThemeRefQualifier'
};
