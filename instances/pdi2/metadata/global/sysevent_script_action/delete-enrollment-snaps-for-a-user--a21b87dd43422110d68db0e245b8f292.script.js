if (GlideProperties.getBoolean('pwd_reset.enable.enrollment_snapshot', true)) {
    deleteEnrollmentSnapshot();
}

function deleteEnrollmentSnapshot() {
    try {
        new PwdEnrollSnapshotUtil().deleteEnrollmentSnapshotsForInValidUsers();
    } catch (e) {
        gs.error("[Script action: Delete enrollment snaps for a user ] - " + e.getMessage());
    }
}
