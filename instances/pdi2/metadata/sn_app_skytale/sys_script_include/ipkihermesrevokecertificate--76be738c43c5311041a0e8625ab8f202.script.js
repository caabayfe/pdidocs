var IPKIHermesRevokeCertificate = Class.create();
IPKIHermesRevokeCertificate.prototype = {
    initialize: function() {},

    revokeCertificate: function(sysId, reason) {
        return new sn_kmf.ScopedRevokeCertificate().revokeCertificateById(sysId, reason, "SERVICENOW_HERMES");
    },

    type: 'IPKIHermesRevokeCertificate'
};
