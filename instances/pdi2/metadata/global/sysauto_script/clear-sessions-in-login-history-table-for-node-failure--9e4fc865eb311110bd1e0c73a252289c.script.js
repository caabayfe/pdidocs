var daysBeforeWhichDataCleanupNeeded = 1;
var batchSize = 1000;
var loginHistoryTableName = 'sys_user_login_history';

clearNodeFailureSessions();

function clearNodeFailureSessions() {
    var totalRecords = 0;
    var loginHistoryGR = getActiveSessionsInLoginHistoryTable();
    var activeSessionsInLoginHistory = {};
    while (loginHistoryGR.next()) {
        activeSessionsInLoginHistory[loginHistoryGR.getValue('session_id')] = true;
        totalRecords++;
        if (totalRecords == batchSize || !loginHistoryGR.hasNext()) {
            var sessionsInvalidated = getInvalidatedSessionsInUserSession(activeSessionsInLoginHistory);
            if (sessionsInvalidated.length > 0) {
                updateLogoutTimeForAllInvalidatedSession(sessionsInvalidated);
            }
            totalRecords = 0;
			activeSessionsInLoginHistory = {};
        }
    }
}

// This will find all the active web sessions in sys_user_login_history table which are active for more than 24 hrs.
function getActiveSessionsInLoginHistoryTable() {

    var dateBeforeWhichDataCleanupNeeded = new GlideDateTime();
    dateBeforeWhichDataCleanupNeeded.addDays(-1 * daysBeforeWhichDataCleanupNeeded);
    var loginHistoryGR = new GlideRecord(loginHistoryTableName);
    loginHistoryGR.addQuery('login_client', 'Web');
    loginHistoryGR.addNullQuery('logout_time');
    loginHistoryGR.addQuery('login_status', 'SUCCESS');
    loginHistoryGR.addQuery('login_time', '<', dateBeforeWhichDataCleanupNeeded);
    loginHistoryGR.query();
    return loginHistoryGR;
}

// This will give all the sessions which are deleted from the sys_user_session but active in sys_user_login_history table.
function getInvalidatedSessionsInUserSession(activeSessionsInLoginHistory) {

    var userSessionGR = new GlideRecord('sys_user_session');
    userSessionGR.addQuery('id', 'IN', Object.keys(activeSessionsInLoginHistory));
    userSessionGR.query();
    while (userSessionGR.next()) {
        delete activeSessionsInLoginHistory[userSessionGR.getValue('id')];
    }
    return Object.keys(activeSessionsInLoginHistory);
}

function updateLogoutTimeForAllInvalidatedSession(sessionsInvalidated) {
    var dbu = new GlideDBUpdate(loginHistoryTableName);
    var dbq = new GlideDBQuery(loginHistoryTableName);
    dbq.addQuery('session_id', 'IN', sessionsInvalidated);
    dbu.setQuery(dbq);
    dbu.setMultiple(true);
    dbu.setValue('logout_time', new GlideDateTime());
    dbu.execute();
    dbu.close();
    dbq.close();
}
