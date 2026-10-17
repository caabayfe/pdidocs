var SDAdminUtils = Class.create();
SDAdminUtils.prototype = {
    initialize: function() {},

    getServiceGroups: function() {
        var serviceGroupList = [];
        var grSG = new GlideRecord("sn_sd_service_group");
        grSG.orderByDesc("name");
        grSG.query();
        while (grSG.next()) {
            serviceGroupList.push({
                id: grSG.sys_id.toString(),
                label: grSG.getDisplayValue("name")
            });
        }
        return serviceGroupList;
    },

    getKBCount: function(encQuery) {
        var gaKB = new GlideAggregate('kb_knowledge');
        gaKB.addAggregate('COUNT');
        gaKB.addEncodedQuery(encQuery, true);
        gaKB.addQuery('active', true);
        gaKB.query();
        if (gaKB.next())
            return parseInt(gaKB.getAggregate('COUNT'));
        return 0;
    },

    getPercentageOfFullyAutomatedCatItem: function() {
        var totalCatItem = 0,
            fullyAut = 0;
        var gaCatItem = new GlideAggregate('sc_cat_item');
        gaCatItem.addQuery('active', true);
        gaCatItem.addAggregate('COUNT', 'fulfillment_automation_level');
        gaCatItem.groupBy('fulfillment_automation_level');
        gaCatItem.query();
        while (gaCatItem.next()) {
            if (gaCatItem.getValue('fulfillment_automation_level') == 'fully_automated')
                fullyAut = parseInt(gaCatItem.getAggregate('COUNT', 'fulfillment_automation_level'));
            totalCatItem += parseInt(gaCatItem.getAggregate('COUNT', 'fulfillment_automation_level'));
        }
        return ((100 * fullyAut) / totalCatItem).toFixed(2);
    },


    getProcessMiningCounts: function(serviceGroup) {
        var gaPM = new GlideAggregate('sn_sd_contributing_indicator_m2m_po_project');
        gaPM.addAggregate('COUNT');
        gaPM.addQuery('active', true);
        gaPM.addQuery('contributing_indicator_registry.active', true);
        gaPM.addQuery('contributing_indicator_registry.service_group', serviceGroup);
        gaPM.query();
        if (gaPM.next())
            return parseInt(gaPM.getAggregate('COUNT'));
        return 0;
    },

    getUsersCount: function(sysIDs) {
        var ga = new GlideAggregate('sys_user_has_role');
        ga.addQuery('role.sys_id', 'IN', sysIDs);
        ga.addQuery('user.active', true);
        ga.groupBy('user');
        ga.query();
        if (ga.next())
            return parseInt(ga.getRowCount());
        return 0;
    },

    getPAJobsCount: function(sysIDs) {
        var encodedQuery = "indicatorIN" + sysIDs,
            paJobs = 0,
            inactiveJobs = 0;
        var gaPAInd = new GlideAggregate("pa_job_indicators");
        gaPAInd.addEncodedQuery(encodedQuery, true);
        gaPAInd.groupBy("job");
        gaPAInd.query();
        while (gaPAInd.next()) {
            paJobs++;
            if (gaPAInd.job.active == false) inactiveJobs++;
        }
        return {
            "totalPAJobs": paJobs,
            "inactivePAJobs": inactiveJobs
        };
    },

    getPAIndConditions: function(paIndSysID) {
        var grInd = new GlideRecord('pa_indicators');
        grInd.addQuery('sys_id', paIndSysID);
        grInd.query();
        if (grInd.next()) {
            var condList = [],
                factsTable = '';
            if (grInd.conditions) condList.push(grInd.conditions.toString());
            if (grInd.cube && grInd.cube.conditions) {
                factsTable = grInd.cube.facts_table;
                condList.push(grInd.cube.conditions.toString());
            }
            return {
                "facts_table": factsTable,
                "condition": condList.join('^')
            };
        }
        return '';
    },

    getAllPAContributingIndcators: function(serviceGroup) {
        var sysIDs = [];

        var gaContrInd = new GlideAggregate("sn_sd_contributing_indicator_registry");
        gaContrInd.addQuery("service_group", serviceGroup);
        gaContrInd.addQuery("active", true);
        gaContrInd.groupBy("contributing_indicator");
        gaContrInd.query();

        while (gaContrInd.next()) {
            if (gaContrInd.getValue("contributing_indicator")) {
                if (gaContrInd.contributing_indicator.type == "2" && gaContrInd.contributing_indicator.formula) {
                    var pattern = /[0-9a-f]{32}/g;

                    var numeratorFormula = gaContrInd.contributing_indicator.formula.split("/")[0];
                    var denominatorFormula = gaContrInd.contributing_indicator.formula.split("/")[1];
                    var numerator = numeratorFormula ? numeratorFormula.match(pattern) : [];
                    var denominator = denominatorFormula ? denominatorFormula.match(pattern) : [];

                    numerator.forEach(function(eachNumerator) {
                        sysIDs.push(eachNumerator);
                    });
                    denominator.forEach(function(eachDenominator) {
                        sysIDs.push(eachDenominator);
                    });

                    continue;
                }

                sysIDs.push(gaContrInd.getValue("contributing_indicator"));
            }
        }

        return sysIDs.join(',');
    },

    isContributingIndConfigured: function(primaryInd, serviceGroup) {
        var gaContrInd = new GlideRecord('sn_sd_contributing_indicator_registry');
        gaContrInd.addActiveQuery();
        gaContrInd.addQuery('primary_kpi', primaryInd);
        gaContrInd.addQuery('service_group', serviceGroup);
        gaContrInd.setLimit(1);
        gaContrInd.query();
        if (gaContrInd.next())
            return true;
        return false;
    },

    type: 'SDAdminUtils'
};
