function transform(input) {
    return new PwdResetCommonUXFVerificationProcessor().getSecurityQuestionVerificationDetails(input.token, input.verificationId);
}
