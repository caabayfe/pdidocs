var isDomainSepActive = GlidePluginManager.isRegistered('com.glide.domain.msp_extensions.installer');
var verificationToUserGroupMapping = {};
var processVerification = {};
generateSnapshot();
/**
 * Populate enrollment table based on process/group/verification
 * to reflect true enrollment status.
 * This is used for reporting.
 */
function generateSnapshot() {
    // first clean out existing snapshot
    var gr = new GlideRecord('pwd_enrollment_snapshot');
    gr.addQuery();
    gr.deleteMultiple();
    //if domain separation plugin is activated
    if (this.isDomainSepActive) {
        generateSnapshotWithDomainSep();
    } else {
        generateSnapshotDefault();
    }
}
function generateSnapshotWithDomainSep() {
    var mgr = new SNC.PwdVerificationManager();
    // update snapshot for each user
    var grUser = new GlideRecord("sys_user");
    grUser.query();
    while (grUser.next()) {
        var verIds = mgr.getVerificationIdsForUser(grUser.getUniqueValue());
        for (var i = 0; i < verIds.size(); i++) {
            updateSnapshot(verIds.get(i), grUser.getUniqueValue());
        }
    }
}
function generateSnapshotDefault() {
    // get apply to all verifications that are not auto-enroll
    gr = new GlideAggregate('pwd_map_proc_to_verification');
    gr.groupBy('verification');
    var qc = gr.addJoinQuery('pwd_process', 'process', 'sys_id');
    qc.addCondition('active', true);
    qc.addCondition('apply_to_all_users', true);
    gr.query();
    var verifications = {};
    while (gr.next()) {
        if (gr.verification.type.auto_enroll) {
            continue;
        }
        verifications[gr.verification] = true;
    }
    // set enrollment status for all users
    if (!verifications.empty()) {
        var users = new GlideRecord('sys_user');
        users.query();
        while (users.next()) {
            for (var verification in verifications) {
                updateSnapshot(verification, users.sys_id);
            }
        }
    }
    // now on to process that are associated with user groups
    // first build a verification to groups mapping
    var processGr = new GlideRecord('pwd_process');
    processGr.addQuery('apply_to_all_users', false);
    processGr.addActiveQuery();
    processGr.query();
    while (processGr.next()) {
        processVerification = {};
        // get verifications first
        var vers = new GlideRecord('pwd_map_proc_to_verification');
        vers.addQuery('process', processGr.sys_id);
        vers.query();
        while (vers.next()) {
            if (vers.verification.type.auto_enroll || (vers.verification in verifications)) {
                continue;
            }
            if (!(vers.verification in verificationToUserGroupMapping)) {
                verificationToUserGroupMapping[vers.verification] = {};
            }
            processVerification[vers.verification] = {};
        }
        // get groups next
        var groups = new GlideRecord('pwd_map_proc_to_group');
        groups.addQuery('process', processGr.sys_id);
        groups.query();
        while (groups.next()) {
            getChildGroups(groups.user_group);
        }
    }
    // we have a verification to groups mapping, 
    // convert it to verification to users
    for (var ver in verificationToUserGroupMapping) {
        // get unique user contained in groups for this verification
        gr = new GlideAggregate('sys_user_grmember');
        var groupIds = [];
        for (var grp in verificationToUserGroupMapping[ver]) {
            groupIds.push(grp);
        }
        gr.addQuery('group', groupIds);
        gr.groupBy('user');
        gr.query();
        while (gr.next()) {
            updateSnapshot(ver, gr.user);
        }
    }
}
function getChildGroups(groupId) {
    for (var ver in processVerification) {
        verificationToUserGroupMapping[ver][groupId] = true;
    }
    var userGroupGr = new GlideRecord('sys_user_group');
    userGroupGr.addActiveQuery();
    userGroupGr.addQuery('parent', groupId);
    userGroupGr.query();
    while (userGroupGr.next()) {
        getChildGroups(userGroupGr.getUniqueValue());
    }
}
function updateSnapshot(verification, user) {
    var status = 2; //inactive
    var enrollment = new GlideRecord('pwd_enrollment');
    enrollment.addQuery('user', user);
    enrollment.addQuery('verification', verification);
    enrollment.query();
    if (enrollment.next()) {
        status = enrollment.status;
    }
    var gr = new GlideRecord('pwd_enrollment_snapshot');
    // make the inserted record's domain to be current user's domain
    if (this.isDomainSepActive) {
        var grUser = new GlideRecord("sys_user");
        grUser.get(user);
        gr.addDomainQuery(grUser);
    }
    gr.verification = verification;
    gr.user = user;
    gr.status = status;
    gr.insert();
}
