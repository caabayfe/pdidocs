// E.g.: code_signing_key_washington_pki_publiccodesignver,  code_signing_key_digicert_issuer_publiccodesignver
var cs_oob_cert_pattern = /^code_signing_key_[A-Za-z_]+_publiccodesignver$/;
var name = current.name.toString();

// Prevent deletion of OOB code signing certs (even by maint)
if (cs_oob_cert_pattern.test(name))
    answer = false;
// Customer code signing certs
else if (name.startsWith("code_signing_key") && new sn_cs_ns.CodeSigningAPI().isCustomerCodeSigningCert(current))
    answer = gs.hasRole("security_admin") && gs.hasRole("sn_kmf.cryptographic_manager");
else
    answer = true;
