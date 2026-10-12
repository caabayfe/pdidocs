var ManualCreateCIExtPoint = Class.create();
ManualCreateCIExtPoint.prototype = {
    initialize: function() {},

    getAppId: function() {
        /** fill this value with your sys_ux_page_registry */
        return '<-- **** sys_ux_page_registry sysId *** -->';
    },

    /**
     * Function to post process a CI following successful insert
     * @param {JSON} ireOutput - Identification and Reconcilation Engine output
     * @param {String} postProcessingContext - Optional context data for post-processing
     */
    postInsertCI: function(ireOutput, addtlContext) {

    },

    type: 'ManualCreateCIExtPoint'
};
