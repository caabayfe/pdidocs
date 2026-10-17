if (GlideProperties.getBoolean('pwd_reset.enable.password_expiration_reminder', false)) {
    deactivateExpirationRecords();
}

function deactivateExpirationRecords() {
    try {
        new global.PwdExpirationUtils().deleteAllExpirationRecordsForAUser("");
    } catch (e) {
        gs.error("[Script action: Delete Expiration records for a user - " + e.getMessage());
    }
}
