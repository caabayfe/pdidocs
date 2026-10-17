var SDAdminHelperSNC = Class.create();

//Service Group to VA plugin id which has topic category
SDAdminHelperSNC.VA_SCOPE_ID = {
    // IT : ITSM Virtual Agent Conversations, Virtual Machine Management for Virtual Agent, Employee Experience VA topics and topic blocks
    "0a7f1437533011101d87ddeeff7b12da": "134450a0b3781300787162ac16a8dc1e,5ff97526c3032010d9c81516d840dd64,91e47f57eb321110add0ddde23522850",
    //HR : HR Service Delivery Virtual Agent Conversations
    "b21e662bc3741110daf3eeb0d840dd24": "c8c5545573d8130000e588e54cf6a71a"
};

//Service Group to VA deflection PA indicator configuration mapping (PA indicator should use ssa_deflection_metric as facts table)
SDAdminHelperSNC.VA_DEFLECTION = {
    // IT : ITSM call deflections from self-solved issues using VA
    "0a7f1437533011101d87ddeeff7b12da": "c55762e5535130102afaddeeff7b123c",
    //HR : HRSM call deflections from self-solved issues using VA
    "b21e662bc3741110daf3eeb0d840dd24": "f976837fc3781110daf3eeb0d840ddb7"
};


//Service Group to KB deflection PA indicator configuration mapping (PA indicator should use ssa_deflection_metric as facts table)
SDAdminHelperSNC.KB_DEFLECTION = {
    // IT : ITSM call deflections from self-solved issues using Knowledge
    "0a7f1437533011101d87ddeeff7b12da": "2893af9907a13010c7d559bf1ad300de",
    //HR : HRSM call deflections from self-solved issues using Knowledge
    "b21e662bc3741110daf3eeb0d840dd24": "b911c011c3951110daf3eeb0d840dd39"
};



SDAdminHelperSNC.prototype = {
    initialize: function() {
        this.adminUtils = new sn_sd.SDAdminUtils();
        this.ssaUtils = new sn_sd.SDSelfServiceAnalyticsUtils();
    },

    getVATopicsCount: function(serviceGroup) {
        var count = 0;
        switch (serviceGroup) {
            case "0a7f1437533011101d87ddeeff7b12da": // IT
                count = this.ssaUtils.getVaCountByCategory(this.ssaUtils.getVACategory(SDAdminHelperSNC.VA_SCOPE_ID[serviceGroup]));
                break;
            case "b21e662bc3741110daf3eeb0d840dd24": // HR
                var paIndEncQuery = this.adminUtils.getPAIndConditions(SDAdminHelperSNC.VA_DEFLECTION[serviceGroup]);
                if (paIndEncQuery && paIndEncQuery.facts_table == 'ssa_deflection_metric' && paIndEncQuery.condition) {
                    var defPatternQuery = this.ssaUtils.parseQueryFromEncodedQuery('ssa_deflection_metric', paIndEncQuery.condition, 'deflection_pattern');
                    count = this.ssaUtils.getVACountByDeflection(this.ssaUtils.getDeflectionPatternIDs(defPatternQuery));
                }
                break;
        }
        return count;
    },

    getKBArticlesCount: function(serviceGroup) {
        var indId = SDAdminHelperSNC.KB_DEFLECTION[serviceGroup];
        if (indId) {
            var paIndEncQuery = this.adminUtils.getPAIndConditions(indId),
                kbEncQuery = '';
            if (paIndEncQuery && paIndEncQuery.facts_table == 'ssa_deflection_metric' && paIndEncQuery.condition)
                kbEncQuery = this.ssaUtils.getSourceEncQuery(paIndEncQuery.condition, 'kb_use', 'article');
            if (kbEncQuery)
                return this.adminUtils.getKBCount(kbEncQuery);
        }
        return 0;
    },

    type: 'SDAdminHelperSNC'
};
