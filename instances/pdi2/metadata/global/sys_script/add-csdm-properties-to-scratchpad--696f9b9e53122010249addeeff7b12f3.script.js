(function executeRule(current, previous /* null when async */) {
	g_scratchpad.is_csdm_enabled = global.CSDMUtil && global.CSDMUtil.isCSDMSupportActivationInstalled();
}(current, previous));
