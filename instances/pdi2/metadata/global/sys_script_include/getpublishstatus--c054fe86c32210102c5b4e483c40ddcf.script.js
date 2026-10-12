var getPublishStatus = Class.create();
getPublishStatus.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'getPublishStatus',

    getStatus: function() {
        var sys_id = this.getParameter('sysparm_sys_id');
        var gr = new GlideRecord('sys_ca_certificate');
        gr.get(sys_id);
        return this.getStatusFromLB(gr);
    },

    getStatusFromLB: function(gr) {
        var glideCACertificateUploader = new SNC.GlideCACertificateUploader();
        var status = glideCACertificateUploader.getCertificateUploadStatus(gr);
        return status;
    }
});
