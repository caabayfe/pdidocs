var EmployeeTaxonomyUtilSNC = Class.create();
EmployeeTaxonomyUtilSNC.prototype = {
    initialize: function() {
        this.EMPLOYEE_TAXONOMY = '1f5d5a40c3203010069aec4b7d40dd93';
    },

    /**
     * This function deactivates and reactivates all the topics of the specified taxonomy, which in turn updates the primary topic field ('taxonomy_topic') for all the content assoicated to this taxonomy. This step is required to make Search configurations work with the specified taxonomy.
     * @param {String} [taxonomyId] - The sys_id of the taxonomy to process. If not provided, defaults to Employee taxonomy.
     **/
    toggleTopicsActiveState: function(taxonomyId) {
        if (!gs.hasRole('taxonomy_admin')) {
            gs.info(gs.getMessage("User {0} does not have write access to the given taxonomy and its topic", [gs.getUserID()]));
            return;
        }
        taxonomyId = taxonomyId || this.EMPLOYEE_TAXONOMY;
        var topicGr = new GlideRecord('topic');
        topicGr.addQuery('taxonomy', taxonomyId);
        topicGr.addActiveQuery();
        topicGr.query();
        while (topicGr.next()) {
            topicGr.setValue('active', false);
            topicGr.update();
            topicGr.setValue('active', true);
            topicGr.update();
        }
    },

    type: 'EmployeeTaxonomyUtilSNC'
};
