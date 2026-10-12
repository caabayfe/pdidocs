var ListCis = Class.create();

(function() {
    var VALID_SYS_ID_REGEX = /^[0-9a-f]{32}$/;

    //passes only valid sys_id format, otherwise '-1'
    function sanitizeIdString(sysId) {
        var val = String(sysId || '');
        return val.length === 32 && VALID_SYS_ID_REGEX.test(val) ? val : '-1';
    }

    ListCis.prototype = {
        initialize: function() {},
        type: 'ListCis'
    };

    /**
     * @param {String} serviceId - sys_id of application service [cmdb_ci_service_discovered]
     * @return {String} comma-separated ssys_ids of CIs contained in the given application service.
     * Up to number of CIs defined in sys_property 'sa.it_service.list_cis_max_count'.
     */
    ListCis.getCis = function(serviceId) {
        if (!gs.hasRole('app_service_user'))
            return '-1';

        var limit = GlideProperties.getInt('sa.it_service.list_cis_max_count', 4000);

        var gr = new GlideRecord('svc_ci_assoc');
        gr.addQuery('service_id', sanitizeIdString(serviceId));
        gr.setLimit(limit);
        gr.orderBy('ci_id');
        gr.query();
        var ciIds = [];
        while (gr.next()) {
            ciIds.push(gr.getValue('ci_id'));
        }

        return ciIds.join(',');
    };
}());
