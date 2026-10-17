function transform(input) {
    return new sn_uib_pwd_reset.PwdResetUXFResetProcessor().getAccountUnlockStatusOnPolling(input.token, input.contextId);
}
