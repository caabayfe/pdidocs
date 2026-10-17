function transform(input) {
    return new PwdResetUXFSMSVerificationProcessor().sendSMSVerificationCode(
        input.token,
        input.verificationId,
        input.mode,
        input.providerId,
        input.countryCode,
        input.countryName);
}
