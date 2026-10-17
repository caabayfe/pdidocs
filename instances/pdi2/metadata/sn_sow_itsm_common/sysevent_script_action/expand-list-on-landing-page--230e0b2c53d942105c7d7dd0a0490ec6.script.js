var ootbConfigs = {
    uxScreenRecord: ['b034cf7877410110c05d885d9f5a9912', 'cbc2f24977070110949878dabd5a9935'],
    uxApplicabilityM2MScreen: ['4f45f34a77010110c05d885d9f5a991e', 'f5e6f34a77010110c05d885d9f5a9905', '9df6f34a77010110c05d885d9f5a9912', 'b9e2f20577c30110949878dabd5a99f6'],
    uxApplicability: ['89080439c7003010202818b1c7c2603d', 'a9e74039c7003010202818b1c7c2605e', 'f8d78039c7003010202818b1c7c260ef', '907dfd0977c30110949878dabd5a9901'],
    users: ['46d44a23a9fe19810012d100cca80666', '5137153cc611227c000bbd1bd8cd2007', '681b365ec0a80164000fb0b05854a0cd']
};
var hideListOnLandingPagePropSysId = 'e02cea20e0910210f87715d33d78aa64';
var currentEventScriptActionSysId = '230e0b2c53d942105c7d7dd0a0490ec6';
gs.info('Executing script action - Expand list on landing page');

if (gs.getProperty('glide.ux.user_criteria_enabled') == 'true' && isActiveUsersForSOW(ootbConfigs)) {
    expandListOnLandingPage();
}
disableCurrentEventScriptAction();

function isActiveUsersForSOW(config) {
    var uxScreenRecordSysIds = config.uxScreenRecord;
    var uxApplicabilityM2MScreenSysIds = config.uxApplicabilityM2MScreen;
    var uxApplicabilitySysIds = config.uxApplicability;
    var ootbUsers = config.users;
    var appGr = new GlideRecord('sys_ux_applicability_m2m_screen');
    appGr.addActiveQuery();
    appGr.addQuery('screen', 'IN', uxScreenRecordSysIds);
    appGr.addQuery('sys_id', 'NOT IN', uxApplicabilityM2MScreenSysIds);
    appGr.query();
    while (appGr.next()) {
        uxApplicabilitySysIds.push(appGr.getValue('applicability'));
    }
    var userCriteria = [];
    var ucIncGr = new GlideRecord('sys_ux_criteria_m2m_inclusion');
    ucIncGr.addActiveQuery();
    ucIncGr.addQuery('applicability', 'IN', uxApplicabilitySysIds);
    ucIncGr.query();
    while (ucIncGr.next()) {
        var ucSysId = ucIncGr.getValue('user_criteria');
        if (userCriteria.indexOf(ucSysId) == -1) {
            userCriteria.push(ucSysId);
        }
    }
    var groupSysIds = [];
    var userSysIds = [];
    var ucGr = new GlideRecord('user_criteria');
    ucGr.addActiveQuery();
    ucGr.addQuery('sys_id', 'IN', userCriteria);
    ucGr.query();
    while (ucGr.next()) {
        var users = ucGr.getValue('user');
        var groups = ucGr.getValue('group');
        if (users) {
            users = users.split(',');
            for (i = 0; i < users.length; i++) {
                var userSysId = users[i];
                if (userSysIds.indexOf(userSysId) == -1) {
                    userSysIds.push(userSysId);
                }
            }
        }
        if (groups) {
            groups = groups.split(',');
            for (i = 0; i < groups.length; i++) {
                var groupSysId = groups[i];
                if (groupSysIds.indexOf(groupSysId) == -1)
                    groupSysIds.push(groupSysId);
            }
        }
    }

    var userGroupGr = new GlideRecord('sys_user_grmember');
    userGroupGr.addQuery('user.active', true);
    userGroupGr.addQuery('group', 'IN', groupSysIds);
    userGroupGr.addQuery('user', 'NOT IN', ootbUsers);
    userGroupGr.setLimit(1);
    userGroupGr.query();
    if (userGroupGr.hasNext())
        return true;

    var userGr = new GlideRecord('sys_user');
    userGr.addActiveQuery();
    userGr.addQuery('sys_id', 'IN', userSysIds);
    userGr.addQuery('sys_id', 'NOT IN', ootbUsers);
    userGr.setLimit(1);
    userGr.query();
    if (userGr.hasNext())
        return true;

    return false;
}

function expandListOnLandingPage() {
    var pagePropGr = new GlideRecord('sys_ux_page_property');
    if (pagePropGr.get(hideListOnLandingPagePropSysId)) {
        pagePropGr.setValue('value', false);
        pagePropGr.update();
        gs.info('Setting value of UX page proerpty hideListOnLandingPage to false.');
    }
}

function disableCurrentEventScriptAction() {
    var eventScriptActionGr = new GlideRecord('sysevent_script_action');
    if (eventScriptActionGr.get(currentEventScriptActionSysId)) {
        eventScriptActionGr.setValue('active', false);
        eventScriptActionGr.update();
        gs.info('Disabling the script action as it should only run once.');
    }
}
