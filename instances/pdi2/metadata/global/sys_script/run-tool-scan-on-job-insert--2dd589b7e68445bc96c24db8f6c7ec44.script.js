(function executeRule(current, previous /*null when async*/) {
    var jobSysId = current.getUniqueValue();
    var client = new sn_auth.GlideAIGToolsScanClient();
    var resp = client.runAuthServerToolsScan(jobSysId);
    if (resp.getResponseCode() != 200) {
        gs.error('[AIToolScan] runAuthServerToolsScan failed. jobSysId=' + jobSysId
            + ' status=' + resp.getResponseCode() + ' body=' + resp.getBody());
    }
})(current, previous);
