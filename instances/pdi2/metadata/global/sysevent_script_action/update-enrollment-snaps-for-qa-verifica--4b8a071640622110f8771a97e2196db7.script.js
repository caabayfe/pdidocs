createOrDeleteEnrollmentSnapshot();

    function createOrDeleteEnrollmentSnapshot() {
        var pwdEnrollmentManager = new SNC.PwdEnrollmentManager();
        var verificationId = event.parm1;

        try {
            var gr = new GlideRecord('pwd_enrollment_snapshot');
            gr.addQuery('verification', verificationId);
            gr.query();

            while (gr.next()) {
                if (pwdEnrollmentManager.isUserEnrolledByVerificationId(gr.user, verificationId)) {
                    gr.setValue("status", PwdConstants.ENROLLMENT_ACTIVE_STATUS);
                } else {
                    gr.setValue("status", PwdConstants.ENROLLMENT_INACTIVE_STATUS);
                }
                gr.update();
            }
        } catch (ex) {
            gs.error("[Script action: Update enrollment snaps for qa verifica. verificationId - " + verificationId + "]. execution error - " + ex);
        }
    }
