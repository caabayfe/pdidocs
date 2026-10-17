
if (GlideSession.get().getProperty("MidCallbackOnCredentialsReload") != true && GlideSession.get().getProperty("OAuthTokenRefreshJobInProgress") != true) {
    var util = new MIDServerSystemCommandUtil();
    util.issueSystemCommandToAllMIDs('credentials_reload');
}
    
