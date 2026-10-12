function transform(input) {
    return new PwdResetUXFSMSVerificationProcessor().getInitialData(input.token, input.verificationId);
}
