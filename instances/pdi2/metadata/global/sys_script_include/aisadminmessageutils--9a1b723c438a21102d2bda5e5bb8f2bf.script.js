var AISAdminMessageUtils = Class.create();
AISAdminMessageUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getMessageForIndexedSourcesWithoutAttachmentIndexing: function() {
        var profileId = this.getParameter('sysparm_profile_id');
        var indexedSourcedWithoutAttachmentIndexing = this.lookupIndexedSourcesWithoutAttachmentIndexing(profileId);
        var message = "";
        if (indexedSourcedWithoutAttachmentIndexing.length > 1) {
            message = gs.getMessage('You are enabling attachment collapsing, but attachments are not configured to be indexed for the following Indexed Sources: {0}', indexedSourcedWithoutAttachmentIndexing.join(", "));
        }
        return message;
    },

    lookupIndexedSourcesWithoutAttachmentIndexing: function(profileId) {
        // Look up search sources from referenced search profile and create array of sys_id's
        var now_GR = new GlideRecord('ais_search_profile_ais_search_source_m2m');
        now_GR.addQuery("profile", profileId);
        now_GR.query();

        var search_source_ids = [];
        while (now_GR.next()) {
            if (!search_source_ids.contains(now_GR.getValue('search_source'))) {
                search_source_ids.push(now_GR.getValue('search_source'));
            }
        }

        // Retrieve indexed sources for each search source 
        var ss_GR = new GlideRecord('ais_search_source');
        ss_GR.addQuery('sys_id', 'IN', search_source_ids.join(','));
        ss_GR.query();

        var datasource_ids = [];
        while (ss_GR.next()) {
            if (!datasource_ids.contains(ss_GR.getValue('datasource'))) {
                datasource_ids.push(ss_GR.getValue('datasource'));
            }
        }

        // Itirate through indexed sources and check for presence of attachments configuration (index_attachments = false) and capture names 
        // in array 
        var datasource_no_attachments_ids = [];
        //Find a false value
        var is_GR = new GlideRecord('ais_datasource_attribute');
        is_GR.addQuery('source', "IN", datasource_ids);
        is_GR.addQuery('attribute', '2dd8f14753320010ffaaddeeff7b1293');
        is_GR.addQuery('value', 'false');
        is_GR.query();

        while (is_GR.next()) {
            if (!datasource_no_attachments_ids.contains(is_GR.getDisplayValue('datasource'))) {
                datasource_no_attachments_ids.push(is_GR.getDisplayValue('datasource'));
            }
        }

        // Return list of indexed sources which are not indexing attachments
        return datasource_no_attachments_ids;
    },
	
    type: 'AISAdminMessageUtils'

});
