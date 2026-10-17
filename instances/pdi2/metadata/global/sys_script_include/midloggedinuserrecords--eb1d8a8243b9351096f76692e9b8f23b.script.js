var MIDLoggedInUserRecords = Class.create();
MIDLoggedInUserRecords.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getNumOfSameLoggedInUsers: function(agentId) {
        // get record from the ecc_agent table using specified sys id
        var agentRecord = new SNC.ECCAgentCache().getBySysId(agentId);
        var agentUserName = agentRecord.user_name;

        if (JSUtil.nil(agentRecord) || !agentUserName)
            return;

        var recs = 0;
        var count = new GlideAggregate('ecc_agent');
        count.addAggregate('COUNT');
        count.addQuery('user_name', agentUserName);
        count.query();

        if (count.next())
            recs = count.getAggregate('COUNT');

        // return the number of MID Servers that use the same logged in user as the record
        return recs;

    },

    shouldDisplayBanner: function() {
        var sysId = this.getParameter('sysparm_sys_id');
        var numSameLoggedInUser = this.getNumOfSameLoggedInUsers(sysId);
        var gr = new GlideRecord('ecc_agent');
        gr.get(sysId);

        var currDate = new GlideDateTime();
        var dismissDate = new GlideDateTime(gr.getValue('logged_in_user_banner_dismiss'));
        var duration = GlideDateTime.subtract(dismissDate, currDate).getNumericValue() / (1000 * 60 * 60);
        var display = 0;

        if ((duration > 24 || !dismissDate.hasDate())) {
            display = 1;
        }

        var isMtls = gr.getValue('is_using_mutual_auth');
        var isContainer = gr.getValue('container_id');
        var isIpki = MidServerDashboardUtil.isIpkiMID(sysId);

        var isInCluster = 0;
        var clusterGR = new GlideRecord('ecc_agent_cluster_member_m2m');
        clusterGR.addQuery('agent', sysId);
        clusterGR.query();

        if (clusterGR.hasNext()) {
            isInCluster = 1;
        }

        return (display == 1 && numSameLoggedInUser > 1 && isMtls == 0 && isContainer == null && isInCluster == 0 && !isIpki);
    },

    handleBannerFlag: function() {
        var date = new GlideDateTime();
        var acknowledge = this.getParameter('sysparm_acknowledge');
        if (acknowledge == 'true') {
            date.addYears(1000);
        }
        var sysId = this.getParameter('sysparm_sys_id');
        var gr = new GlideRecord('ecc_agent');
        gr.get(sysId);
        gr.setValue('logged_in_user_banner_dismiss', date);
        gr.update();
    },

    type: 'MIDLoggedInUserRecords'
});
