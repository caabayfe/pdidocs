var DiscoveryAttachments = Class.create();
DiscoveryAttachments.prototype = {
    initialize: function(statusID) {
        if (!statusID)
            statusID = agent_correlator;
        this.statusID = statusID;
    },
    
    deleteAttachments: function() {
        var saveEm = GlideProperties.getBoolean('glide.discovery.sensors.save_attachments');
        if (saveEm)
            return;

        var sa = new GlideSysAttachment();
        var egr = new GlideRecord('ecc_queue');
        egr.addQuery('agent_correlator', this.statusID);
        egr.addQuery('queue', 'input');
        egr.addQuery('payload', 'STARTSWITH', '<see_attachment/>');
        egr.query();
        while (egr.next()) {
            sa.deleteAll(egr);
            egr.payload = '<attachments_removed_after_processing/>';
            egr.update();
        }
    },
    
    type: 'DiscoveryAttachments'
}
