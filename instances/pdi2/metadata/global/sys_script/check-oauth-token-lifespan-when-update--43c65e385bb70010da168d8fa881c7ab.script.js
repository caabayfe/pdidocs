(function executeRule(current, previous /*null when async*/) {
	var authTokenChecker = new OauthTokenChecker();
	authTokenChecker.checkRefreshTokenLifespan(current, previous);
})(current, previous);
