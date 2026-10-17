var AppAndCustomTableRecommenderConstants = Class.create();

(function() {
    // When a license weight crosses this value, it will be applied regardless if all heuristics have completed
    AppAndCustomTableRecommenderConstants.LICENSE_THRESHOLD = 999;
    AppAndCustomTableRecommenderConstants.BASE_VALUE = 100;
    AppAndCustomTableRecommenderConstants.FALLBACK_LICENSE = "FALLBACK_LICENSE";
    AppAndCustomTableRecommenderConstants.EXCLUDED = "EXCLUDED_TABLE";
    AppAndCustomTableRecommenderConstants.MISSING_SERVICENOW_TABLE = "MISSING_SERVICENOW_TABLE";
    AppAndCustomTableRecommenderConstants.MISSING_SUBSCRIPTION_NAME = "MISSING_SUBSCRIPTION_NAME";

    AppAndCustomTableRecommenderConstants.getFallBackLicenseWeight = () => Number(gs.getProperty("sn_entitlement.subscription_recommender_v2.fallback_license_weight", 0));
    AppAndCustomTableRecommenderConstants.getDecay = () => Number(gs.getProperty("sn_entitlement.subscription_recommender_v2.decay", 0));
    AppAndCustomTableRecommenderConstants.getNumRecommendations = () => Number(gs.getProperty("sn_entitlement.subscription_recommender_v2.num_recommendations", 1));
    AppAndCustomTableRecommenderConstants.getMaxPassIterations = () => Number(gs.getProperty("sn_entitlement.subscription_recommender_v2.max_pass_iterations", 100));

    AppAndCustomTableRecommenderConstants.RELATION_CODES = {
        assignment: 0, // subscription field
        subscription: 1, // subscription field
        extension: 2, // extension
        referenceTo: 3, // referring field
        referenceFrom: 4, // reference field
        relationTo: 5, // relationship to
        relationFrom: 6, // relationship from
        flowAction: 7, // flow action
        flowTrigger: 8 // flow is trigger
    };

    AppAndCustomTableRecommenderConstants.RELATION_DETAILS = {
        [AppAndCustomTableRecommenderConstants.RELATION_CODES.assignment]: {
            weight: AppAndCustomTableRecommenderConstants.LICENSE_THRESHOLD + 1,
            label: 'assigned license'
        },
        [AppAndCustomTableRecommenderConstants.RELATION_CODES.subscription]: {
            weight: AppAndCustomTableRecommenderConstants.LICENSE_THRESHOLD + 1,
            label: 'subscription'
        },
        [AppAndCustomTableRecommenderConstants.RELATION_CODES.extension]: {
            weight: AppAndCustomTableRecommenderConstants.LICENSE_THRESHOLD + 1,
            label: 'extension'
        },
        [AppAndCustomTableRecommenderConstants.RELATION_CODES.referenceTo]: {
            weight: AppAndCustomTableRecommenderConstants.BASE_VALUE,
            label: 'reference to this table'
        },
        [AppAndCustomTableRecommenderConstants.RELATION_CODES.referenceFrom]: {
            weight: AppAndCustomTableRecommenderConstants.BASE_VALUE * 0.5,
            label: 'reference from this table'
        },
        [AppAndCustomTableRecommenderConstants.RELATION_CODES.relationTo]: {
            weight: AppAndCustomTableRecommenderConstants.BASE_VALUE * 0.9,
            label: 'relationship to this table'
        },
        [AppAndCustomTableRecommenderConstants.RELATION_CODES.relationFrom]: {
            weight: AppAndCustomTableRecommenderConstants.BASE_VALUE * 0.5,
            label: 'relationship from this table'
        },
        [AppAndCustomTableRecommenderConstants.RELATION_CODES.flowAction]: {
            weight: AppAndCustomTableRecommenderConstants.BASE_VALUE * 0.75,
            label: 'flow action'
        },
        [AppAndCustomTableRecommenderConstants.RELATION_CODES.flowTrigger]: {
            weight: AppAndCustomTableRecommenderConstants.BASE_VALUE * 1.5,
            label: 'flow trigger'
        }
    };

    AppAndCustomTableRecommenderConstants.REASONS = {
        ASSIGNMENT: "ASSIGNMENT",
        SUBSCRIPTION: "SUBSCRIPTION",
        EXTENDS: "EXTENDS",
        RELATION: "RELATION",
        RELATION_OOTB: "RELATION_OOTB",
        RELATION_CUSTOM: "RELATION_CUSTOM",
        DEFAULT: "DEFAULT",
    };

    AppAndCustomTableRecommenderConstants.prototype = {
        initialize: function() {
            throw 'Not supported';
        },
        label: 'AppAndCustomTableRecommenderConstants',
    };
})();
