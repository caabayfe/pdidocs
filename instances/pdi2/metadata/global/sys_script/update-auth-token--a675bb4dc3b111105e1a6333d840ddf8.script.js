(function executeRule(current, previous /*null when async*/) {

    var currTeamId = current.getValue("team_id");
    var currKeyId = current.getValue("key_id");
    var currSigningKey = current.getValue("signing_key");
    if (!currTeamId || !currKeyId || !currSigningKey) {
        return;
    }

    var currDecryptedSigningKey = current.signing_key.getDecryptedValue();
    if (current.operation() == "insert") {
        current.auth_token = SNC.ApnsAuthTokenUtil.generateApnsAuthToken(currTeamId, currKeyId, currDecryptedSigningKey);
        current.token_updated_on = gs.nowDateTime();
        return;
    }

    if (current.operation() == "update") {
        if (currTeamId != previous.getValue("team_id") ||
            currKeyId != previous.getValue("key_id") ||
            currSigningKey != previous.getValue("signing_key")) {
            current.auth_token = SNC.ApnsAuthTokenUtil.generateApnsAuthToken(currTeamId, currKeyId, currDecryptedSigningKey);
            current.token_updated_on = gs.nowDateTime();
        }
        return;
    }

})(current, previous);
