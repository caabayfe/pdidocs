function transform(input) {
    return new sn_uib_pwd_reset.PwdResetUXFEmailVerificationProcessor().generateCode(input.token, input.verificationId, input.mode);
}
