function transform(input) {
    return new sn_uib_pwd_reset.PwdResetCommonUXFVerificationProcessor().getPersonalDataVerificationDetails(input.verificationId, input.token);
}
