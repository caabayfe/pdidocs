gs.include("JWT_Util");
// hide the scope
(function(){
	sendEmailNotificationBasedOnExpiry();
})();

function sendEmailNotificationBasedOnExpiry() {
	var keysGr = new GlideRecord("jwt_keystore_aliases");
	keysGr.addActiveQuery();
	keysGr.query();
	
	var jwtUtil = new JWT_Util();
	while(keysGr.next()) {
		jwtUtil.sendEmailNotificationBasedOnExpiry(keysGr);
	}
}
