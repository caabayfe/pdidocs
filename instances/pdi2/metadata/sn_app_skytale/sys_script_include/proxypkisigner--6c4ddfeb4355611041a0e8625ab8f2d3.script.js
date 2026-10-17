var ProxyPKISigner = Class.create();
ProxyPKISigner.prototype = {
    initialize: function() {},

    signCertificate: function(rawCSR) {
        return new sn_kmf.KMFInstancePKISigner().signCertificate("SERVICENOW_HERMES", rawCSR);
    },

    type: 'ProxyPKISigner'
};
