function transform(input) {
    return new sn_uib_pwd_reset.PwdResetUXFSuccessProcessor().getPasswordToDisplay(input.token, input.password,input.isDisplayPassword);
}
