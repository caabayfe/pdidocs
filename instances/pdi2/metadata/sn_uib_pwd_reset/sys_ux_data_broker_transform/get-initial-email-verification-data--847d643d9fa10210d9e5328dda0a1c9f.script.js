function transform(input) {
  return new sn_uib_pwd_reset.PwdResetUXFEmailVerificationProcessor().getInitialData(input.token, input.verificationId);
}
