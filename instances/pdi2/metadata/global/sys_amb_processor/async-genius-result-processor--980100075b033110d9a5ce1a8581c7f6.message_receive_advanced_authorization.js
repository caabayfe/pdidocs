function /*boolean*/ authorizeReceive( /*String*/ channel, /*UnmodifiableMap<String, Object>*/ message, /*String*/ sender, /*String*/ recipient) {
    // Deny access to unauthenticated users if public access is disabled
    if (gs.getProperty("glide.ais.query.async.disable_public_access", false) == 'true' && !gs.isLoggedIn()) {
        gs.debug("Denying message receive access for channel: " + channel + " for unauthenticated user with session ID: " + gs.getSessionID());
        return false;
    }

    var allowed = channel == "/search/geniusresult/" + gs.getSessionID();
    gs.debug("MESSAGE RECEIVE - Session " + gs.getSessionID() + " allowed to access " + channel + "? : " + allowed);
    if (!allowed)
        gs.warn("Unauthorized attempt to receive an AMB message on channel: " + channel + " by user: " + gs.getUserID() + " (session ID: " + gs.getSessionID() + ")");
    return allowed;
}
