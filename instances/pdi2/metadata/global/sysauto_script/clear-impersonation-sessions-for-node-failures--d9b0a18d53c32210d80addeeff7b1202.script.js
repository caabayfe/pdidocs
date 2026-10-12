var daysBeforeWhichDataCleanupNeeded = 1;
var batchSize = 1000;
var impersonationHistoryTable = 'sys_user_impersonation_history';

clearNodeFailureImpersonationSessions();

function clearNodeFailureImpersonationSessions() {
    var totalRecords = 0;
    var impersonationGR = getActiveImpersonationSessions();
    var activeImpersonationSessions = {};

    while (impersonationGR.next()) {
        activeImpersonationSessions[impersonationGR.getValue('session_id')] = true;
        totalRecords++;

        if (totalRecords == batchSize || !impersonationGR.hasNext()) {
            var sessionsInvalidated = getInvalidatedSessionsFromUserSession(activeImpersonationSessions);
            if (sessionsInvalidated.length > 0) {
                updateImpersonationEndTime(sessionsInvalidated);
            }
            totalRecords = 0;
            activeImpersonationSessions = {};
        }
    }
}

function getActiveImpersonationSessions() {
    var cutoffTime = new GlideDateTime();
    cutoffTime.addDays(-1 * daysBeforeWhichDataCleanupNeeded);

    var gr = new GlideRecord(impersonationHistoryTable);
    gr.addNullQuery('impersonation_end_time');
    gr.addQuery('impersonation_start_time', '<', cutoffTime);
    gr.query();
    return gr;
}

function getInvalidatedSessionsFromUserSession(activeSessionsMap) {
    var sessionGR = new GlideRecord('sys_user_session');
    sessionGR.addQuery('id', 'IN', Object.keys(activeSessionsMap));
    sessionGR.query();

    while (sessionGR.next()) {
        delete activeSessionsMap[sessionGR.getValue('id')];
    }

    return Object.keys(activeSessionsMap); 
}

function updateImpersonationEndTime(invalidatedSessionIds) {
    var dbu = new GlideDBUpdate(impersonationHistoryTable);
    var dbq = new GlideDBQuery(impersonationHistoryTable);
    dbq.addQuery('session_id', 'IN', invalidatedSessionIds);
    dbq.addNullQuery('impersonation_end_time'); 
    dbu.setQuery(dbq);
    dbu.setMultiple(true);
    dbu.setValue('impersonation_end_time', new GlideDateTime());
    dbu.execute();
    dbu.close();
    dbq.close();
}
