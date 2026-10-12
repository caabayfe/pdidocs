GlideSessions.lockOutSessionsInAllNodes(current.user_name);
var oAuthClient = new sn_auth.GlideOAuthClient();
oAuthClient.revokeTokensForUser(current.sys_id);
