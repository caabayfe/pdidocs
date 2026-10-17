if (GlideProperties.getBoolean('pwd_reset.enable.enrollment_snapshot', true)) {
    deleteEnrollmentSnapshot();
}

function deleteEnrollmentSnapshot() {
    var processId = event.parm1;

    try {
        new PwdEnrollSnapshotUtil().deleteInValidEnrollmentSnapshots();
    } catch (ex) {
        gs.error("[Script action: Delete enrollment snaps for a process. processId- " + processId + "]. execution error - " + ex);
    }
}
