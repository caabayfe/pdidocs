testLDAPServers();

function testLDAPServers() {
    var ldapServer = new GlideRecord("ldap_server_config");
    ldapServer.addActiveQuery();
    ldapServer.query();
    var errMsg = "";
    var total_serverconfigs = 0; 
    var failed_serverconfigs = 0;
    var succeeded_serverconfigs = 0;
    while (ldapServer.next()) {
        total_serverconfigs++;
        var ldap = new GlideLDAP();
        // get LDAP server config
        ldap.setConfigID(ldapServer.getUniqueValue());
        // Setup connection parameters
        var env = ldap.setup();
        if (env == null) {
            failed_serverconfigs++;
            errMsg = "Failed environment setup, missing URL";
            gs.eventQueue("ldap.connection_failed",  ldapServer, ldapServer.getDisplayValue(), errMsg);
            gs.logError("LDAP Server: " + ldapServer.getDisplayValue() + " failed scheduled connection test: " + errMsg, "LDAP");
            continue;
        }
        // Test Connection
        errMsg = "Go to LDAP server record and perform a manual connection test for additional information. ";
        try {
            var opStatusTrueAuthoritative    = true;
            var opStatusFalseAuthoritative  = false;
            var ldapConnectionTester = new GlideLDAPTestConnectionProcessor(ldapServer.getUniqueValue(), null, opStatusTrueAuthoritative, opStatusFalseAuthoritative);
            ldapConnectionTester.testServerURLConnections();
            var allURLConnResults = gs.getSession().getProperty("ldap_test.all_urls.result");
            // Clear results in session
            gs.getSession().clearProperty("ldap_test.all_urls.result");
            
            var urlresultIterator = allURLConnResults.iterator();
            var retestURLIDs = new Array();
            var retestURLs = new Array();
            var total_urls = allURLConnResults.size();
            var active_urls = 0;
            var failed_urls = 0;
           
            while(urlresultIterator.hasNext()) {
                var ldapURL = urlresultIterator.next();
                if(ldapURL.isActive() == false)
                    continue;
                
                active_urls++;
                // Connection Successful
                // If server operational_status is false and connection successful it will be changed to true, if opStatusTrueAuthoritative=true
                // Also ldap.operational_status.up event will be fired
                if(ldapURL.getTestErrorCode() == 0)
                    continue;
                
                // Connection Failed
                failed_urls++;
                var eventParm1 = "LDAP Server: " + ldapServer.getDisplayValue() + ' URL: ' + ldapURL.getURL();
                var urlErrMsg = '';
                urlErrMsg += "ErrorCode: " + ldapURL.getTestErrorCode() + ". ";
                urlErrMsg += "ErrorMessage: " +  GlideXMLUtil.removeInvalidChars(ldapURL.getTestErrorMessage()) + ". ";
                var urlRecord = new GlideRecord('ldap_server_url');
                urlRecord.get(ldapURL.getID());
                gs.eventQueue("ldap.connection_failed",  ldapServer, eventParm1, urlErrMsg);
                gs.logError(eventParm1 + " failed scheduled connection test. " + urlErrMsg, "LDAP");
                    
                // Collect the list of URL's that needs retest in a SubJob
                retestURLIDs.push(ldapURL.getID());
                retestURLs.push(ldapURL.getURL());
            }// while
            
            // we have more than 1 active urls and they all failed test connection 
            // for succeeded ones, we also only count the the ones that have more than 1 active urls
            if (active_urls>0) {
                if (active_urls == failed_urls) {
                    failed_serverconfigs++; 
                    SNC.SecurityEventSender.sendLDAPTestConnectionFailedSummaryEventData(ldapServer.getUniqueValue(), "total_urls=" + total_urls + ", active_urls="+active_urls + ", failed_urls="+failed_urls);
                } else {
                    succeeded_serverconfigs++;
                }
            }
            
            if(retestURLIDs.length > 0 && opStatusFalseAuthoritative == false) {
                // Retest and set URLs operational_status to false, if connection fails again in LDAP SubJob.
                gs.log( "LDAP SubJob to retest failed URLs. Server=" + ldapServer.getDisplayValue() + ' URLs=' + retestURLs.join(' ') , "LDAP");
                createSubJob(getSubJobScript(ldapServer.getUniqueValue(), retestURLIDs));
            }
        } catch(e) {
            failed_serverconfigs++;
            // Fire event to trigger email notification
            errMsg += e.message;
            gs.eventQueue("ldap.connection_failed",  ldapServer, ldapServer.getDisplayValue(), errMsg);
            gs.logError("LDAP Server: " + ldapServer.getDisplayValue() + " failed scheduled connection test. " + errMsg, "LDAP");
        }
    }
    
    // generate summary event for all server configs
    SNC.SecurityEventSender.sendLDAPTestConnectionAllServConfigSummaryEventData("total_serverconfigs=" + total_serverconfigs + ", succeeded_serverconfigs=" + succeeded_serverconfigs + ", failed_serverconfigs=" + failed_serverconfigs);
}

function getSubJobScript(ldapServerId, retestURLIDs) {
    var subJobScript = 'new LDAPURLUtils().runSubJobScript(\"' + ldapServerId + '\", \"' + retestURLIDs.join() + '\")';
    return subJobScript;
}

function createSubJob(subJobScript) {
    var name   = "LDAP Connection Test - SubJob";
    var when   = getNextActionTime();
    GlideRunScriptJob.scheduleScript(subJobScript, name, when);
}

function getNextActionTime() {
    var jobRunInterval = new GlideDateTime(current.run_period);
    var nextActionInSec = Math.min(5*60, jobRunInterval.getNumericValue()/2000);
    gs.log('LDAP SubJob run in ' + nextActionInSec + ' seconds', "LDAP");
    var nextActionTime = new GlideDateTime();
    nextActionTime.addSeconds(nextActionInSec);
    return nextActionTime;
}
