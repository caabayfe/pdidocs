(function executeRule(current, previous /*null when async*/) {
	
	gs.include("JWT_Util");
	
	var jwtUtil = new JWT_Util();
	jwtUtil.sendEmailNotificationBasedOnExpiry(current);
	
})(current, previous);
