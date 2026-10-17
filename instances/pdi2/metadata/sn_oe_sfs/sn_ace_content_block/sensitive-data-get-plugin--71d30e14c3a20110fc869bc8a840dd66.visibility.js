/**
 * If neither SDH or Data Privacy is installed, advice user to install Data Privacy
 */
answer = !(CIPlugin.SensitiveDataHandling().isActive() || new sn_oe_sfs.CIUtil().isDataPrivacyForVASupported());
