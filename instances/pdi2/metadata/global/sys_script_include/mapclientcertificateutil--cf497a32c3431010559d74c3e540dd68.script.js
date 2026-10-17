var MapClientCertificateUtil = Class.create();
MapClientCertificateUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getSubjectName: function() {
        var StringUtil = GlideStringUtil;
        var certDescription = "";
        var certEncoded = this.getCert();
        var certDecoded = decodeURIComponent(certEncoded);
        var str = certDecoded.toString();
        str = str.substring(str.indexOf('-----BEGIN CERTIFICATE-----') + 28, str.indexOf('-----END CERTIFICATE-----') - 1).trim();
        var bytes = StringUtil.base64DecodeAsBytes(str);
        var cert = SNC.CertificateUtil.getDERCert(bytes);
        var subject = "";
	if(cert)
	    subject = cert.getSubjectX500Principal().toString();
        var result = this.newItem("result");
        result.setAttribute("certDescription", subject);
    },

    validateResponse: function() {
        var success = SNC.AuthenticationHelper.associateUserCertificate(this.getCert());

        var result = this.newItem("result");
        result.setAttribute("success", success);
    },

    getCertHeader: function() {
        var cert = this.getCert();
        var certDecoded = decodeURIComponent(cert);
        var result = this.newItem("result");
        result.setAttribute("cert", certDecoded);
    },

    getCert: function() {
        var request = GlideTransaction.get().getRequest();
        var certHeader = request.getHeader("X-Client-Cert");
        return certHeader;
    },

    type: 'MapClientCertificateUtil'
});
