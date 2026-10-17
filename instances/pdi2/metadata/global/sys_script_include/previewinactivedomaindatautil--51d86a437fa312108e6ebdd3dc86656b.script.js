var PreviewInactiveDomainDataUtil = Class.create();
PreviewInactiveDomainDataUtil.prototype = {
    initialize: function() {
        this.inactiveDomainsNotPreviewedMap = {};
    },

    /**
     * Get inactive domains which are staged for deletion and not previewed
     */
    getInactiveDomainsNotPreviewed: function() {
        var inactiveDomainsGr = new GlideRecord('domain_cleanup_queue');
        inactiveDomainsGr.addQuery('state', 'staged_and_deletion_planned');
        inactiveDomainsGr.addQuery('preview_state', 'not_previewed');
        inactiveDomainsGr.query();
        while (inactiveDomainsGr.next()) {
            this.inactiveDomainsNotPreviewedMap[inactiveDomainsGr.getValue('domain')] = inactiveDomainsGr.getUniqueValue();
        }
        return this.inactiveDomainsNotPreviewedMap;
    },

    /**
     * Check if there are any inactive domains which are staged for deletion and not previewed
     */
    isInactiveDomainAvailableForPreview: function() {
        this.getInactiveDomainsNotPreviewed();
        return Object.keys(this.inactiveDomainsNotPreviewedMap).length !== 0;
    },

    /**
     * Populate inactive domain data for inactive domains which are staged for deletion and not previewed
     */
    populateDomainData: function() {
        var inactiveDomainsMap = this.getInactiveDomainsNotPreviewed();
        var domainCleanUp = new SNC.DomainCleanup();
        if (Object.keys(inactiveDomainsMap).length !== 0) {
            // For Domain Separated Tables
            var startIndex = 0;
            var batchSize = 20; //Process 20 tables in a batch
            var domainTables = j2js(GlideDomainSupport.getDomainTables()); //Get List of Domain Separated Tables
            this.addDomainMasterTables(domainTables); //Add list of Domain Master Tables
            var domainTablesBatch = domainTables.slice(startIndex, startIndex + batchSize);
            //Set inactive domains being previewed to in progress state
            this.updatePreviewState(inactiveDomainsMap, 'preview_in_progress');

            while (domainTablesBatch.length !== 0) {
                for (var i = 0; i < domainTablesBatch.length; i++) {
                    domainCleanUp.populateInactiveDomainData(inactiveDomainsMap, domainTablesBatch[i]);
                }
                startIndex = startIndex + batchSize;
                domainTablesBatch = domainTables.slice(startIndex, startIndex + batchSize);
            }

            this.updatePreviewState(inactiveDomainsMap, 'previewed');
            GlideSysLog.info('syslog_domain', 'com.glide.domain.data_cleanup', "All domain separated tables have been successfully processed for populating inactive domain data.");
        } else {
            GlideSysLog.info('syslog_domain', 'com.glide.domain.data_cleanup', "No new inactive domains are available to look for it's associated data.");
        }
    },

    /**
     * Update preview state for inactive domains which are staged for deletion
     */
    updatePreviewState: function(inactiveDomainsMap, state) {
        var inactiveDomainsInQueue = [];
        Object.keys(inactiveDomainsMap).forEach(function(domain) {
            var inactiveDomainSysId = inactiveDomainsMap[domain].toString();
            inactiveDomainsInQueue.push(inactiveDomainSysId);
        });

        var inactiveDomainsGr = new GlideRecord('domain_cleanup_queue');
        inactiveDomainsGr.addQuery('sys_id', 'IN', inactiveDomainsInQueue);
        inactiveDomainsGr.setValue('preview_state', state);
        inactiveDomainsGr.updateMultiple();
    },

    /**
     * Get Domain Master Tables
     */
    addDomainMasterTables: function(domainTables) {
        var gr = new GlideRecord("sys_dictionary");
        gr.addQuery("attributes", "CONTAINS", "domain_master");
        gr.query();
        while (gr.next()) {
            domainTables.push(gr.getValue("name"));
        }
        return domainTables;
    },

    type: 'PreviewInactiveDomainDataUtil'
};
