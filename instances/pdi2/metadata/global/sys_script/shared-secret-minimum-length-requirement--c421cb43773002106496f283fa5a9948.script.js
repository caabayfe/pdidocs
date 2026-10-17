(function executeRule(current, previous) {
    var JavaString = Packages.java.lang.String;
    var shared_secret = current.secret.getDecryptedValue();
    var shared_secret_bits_length = new JavaString(shared_secret).getBytes("UTF-8").length * 16;
    if (shared_secret_bits_length < 512) {
        gs.addErrorMessage(gs.getMessage("Shared Secret length should not be less than 32 Bytes"));
        current.setAbortAction(true);
    }
})(current, previous);
