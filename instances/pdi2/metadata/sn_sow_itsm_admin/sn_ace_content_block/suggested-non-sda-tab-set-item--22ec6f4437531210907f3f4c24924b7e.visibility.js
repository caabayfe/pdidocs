var SDA_ROLE_IS_SUGGESTED_TAB_VISIBLE_CONFIG_SETTING = "1fd84465ff531210907fffffffffff7d";
var isSuggestedTabVisible = false;
var configSettingsGR = new GlideRecord("sn_sow_cfg_stg");
if(configSettingsGR.get(SDA_ROLE_IS_SUGGESTED_TAB_VISIBLE_CONFIG_SETTING)) {
	isSuggestedTabVisible = configSettingsGR.getValue("value") == "true";
}
answer = isSuggestedTabVisible;
