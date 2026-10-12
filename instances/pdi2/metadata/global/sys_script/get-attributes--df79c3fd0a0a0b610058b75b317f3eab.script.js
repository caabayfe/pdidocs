(function() {
    var StringUtil = GlideStringUtil;

    var bytes;
    if (current.format == "pem") {
        var str = current.pem_certificate.toString();
        str = str.substring(str.indexOf('-----BEGIN CERTIFICATE-----') + 28, str.indexOf('-----END CERTIFICATE-----') - 1).trim();
        bytes = StringUtil.base64DecodeAsBytes(str);
    } else {
        // der format in attachment
        var attachment = new GlideSysAttachment();
        bytes = attachment.getBytes("sys_certificate", current.sys_id);
    }

    if (bytes) {
        try {
            var cert = SNC.CertificateUtil.getDERCert(bytes);
            if (!cert) {
                gs.addErrorMessage(gs.getMessage("Unable to parse certificate"));
                return;
            }

            if (current.name.startsWith("ejbca_"))
                setCertAttributesForEJBCA(cert);
            else
                setCertAttributes(cert);

        } catch (e) {
            gs.addErrorMessage(gs.getMessage("Unable to parse certificate, check to be sure it is in <a class='breadcrumb'  href='http://en.wikipedia.org/wiki/X.509'>X.509</a> PEM or DER format"));

            if (current.format == "der") {
                //DEF0288043 set cert to false instead of delete it
                current.setValue('active', 'false');
            }
        }
    }

    function setCertAttributesForEJBCA(cert) {
        var notAfter = cert.getNotAfter();
        if (!current.expires)
            current.expires.setValue(new GlideDateTime(notAfter));

        var notBefore = cert.getNotBefore();
        if (!current.valid_from)
            current.valid_from.setValue(new GlideDateTime(notBefore));

        if (!current.issuer)
            current.issuer = cert.getIssuerX500Principal().toString();
        if (!current.subject)
            current.subject = cert.getSubjectX500Principal().toString();

        var terms = current.subject.toString().split(",");
        setShortDescription(terms);
    }

    function setCertAttributes(cert) {
        var notAfter = cert.getNotAfter();
        current.expires.setValue(new GlideDateTime(notAfter));

        var notBefore = cert.getNotBefore();
        current.valid_from.setValue(new GlideDateTime(notBefore));

        current.issuer = cert.getIssuerX500Principal().toString();
        current.subject = cert.getSubjectX500Principal().toString();

        var terms = current.subject.toString().split(",");
        setShortDescription(terms);
    }

    function setShortDescription(terms) {
        for (i = 0; i < terms.length; i++) {
            var term = terms[i].trim().split("=");
            if (term[0] == "CN") {
                current.short_description = term[1];
                break;
            }
        }
    }

})();
