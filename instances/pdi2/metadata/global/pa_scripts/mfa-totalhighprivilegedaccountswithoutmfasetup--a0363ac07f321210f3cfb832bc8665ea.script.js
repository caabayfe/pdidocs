getCount();

function getCount() {
    return SNC.MultifactorAuthUtil.getHighPrivilegedAccountsWithoutMFASetupCount();
}
