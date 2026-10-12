function onClickWfSubmit(dis) {

	// delegate to the global New (sysverb_insert) action
	var SYSVERB_INSERT_GLOBAL = "42da42d00a0a0b340066377beb6dd099";
	
	dis.setAttribute("gsft_id", SYSVERB_INSERT_GLOBAL);
	return gsftSubmit(dis);
}
