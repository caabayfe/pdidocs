/**
 * @param {params} params
  @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    // build tabs object
    let translatedLabels = api.data.get_translated_labels.output;
    api.setState("translatedLabels", translatedLabels);
    let tabs = {};
    tabs.completeness = [{
        "id": "required",
        "label": translatedLabels.MISSING_REQUIRED_ATTRIBUTES,
        "resultsLabel": translatedLabels.CIS_MISSING_REQUIRED_ATTRIBUTES
    }, {
        "id": "recommended",
        "label": translatedLabels.MISSING_RECOMMENDED_ATTRIBUTES,
        "resultsLabel": translatedLabels.CIS_MISSING_RECOMMENDED_ATTRIBUTES
    }];
    tabs.correctness = [{
        "id": "duplicate",
        "label": translatedLabels.DUPLICATE_CIS,
        "resultsLabel": translatedLabels.CIS_THAT_ARE_DUPLICATES
    }, {
        "id": "Orphan",
        "label": translatedLabels.ORPHAN_CIS,
        "resultsLabel": translatedLabels.CIS_THAT_ARE_ORPHANS
    }, {
        "id": "staleness",
        "label": translatedLabels.STALE_CIS,
        "resultsLabel": translatedLabels.CIS_THAT_ARE_STALE
    }];
    tabs.compliance = [{
        "id": "audit",
        "label": translatedLabels.AUDIT,
        "resultsLabel": translatedLabels.CIS_NOT_COMPLIANT_WITH_AUDIT
    }];
    api.setState('tabs', tabs);

    let selectedHealthCard = api.context.props.selectedHealthCard || 'completeness';
    api.setState('selectedHealthCard', selectedHealthCard);
    api.setState('currentTabs', tabs[selectedHealthCard]);
    let id = tabs[selectedHealthCard][0].id;
    api.setState('selectedTabIndex', 0);
    api.setState('selectedMetric', id);

    // build scores object
    let scores = {
        "classResults" :{
            "completeness" : {},
            "correctness" : {},
            "compliance" : {}
        },
        "serviceResults" : {
            "completeness" : {},
            "correctness" : {},
            "compliance" : {}
        },
        "groupResults" : {
            "completeness" : {},
            "correctness" : {},
            "compliance" : {}
        },
        "completenessCard" : {
            "scoreSettings": {},
            "semiDonut": {},
            "errorConfig": {},
            "caption" : {}
        },
        "correctnessCard" : {
            "scoreSettings": {},
            "semiDonut": {},
            "errorConfig": {},
            "caption" : {}
        },
        "complianceCard" : {
            "scoreSettings": {},
            "semiDonut": {},
            "errorConfig": {},
            "caption" : {}
        },
        "legacyScore" : 100,
        "overAllScore" : "N/A"
    };
    
    api.setState('scores',scores);

    // set welcome message
    const d = new Date();
    let hour = d.getHours();
    let greeting = translatedLabels.GOOD_MORNING;
    if (hour >= 18 || hour <= 5) {
        // between 6pm and 6am
        greeting = translatedLabels.GOOD_EVENING;
    } else if (hour >= 12 && hour <= 17) {
        // between 12pm and 6am
        greeting = translatedLabels.GOOD_AFTERNOON;
    }
    const { firstName, lastName, language } = api.context.session.user || {};
     
    // Default to "Admin" if both names are missing 
    let name = "Admin";
    if (firstName || lastName) {
        // Use last name for Chinese & Japanese language, otherwise use first name
        name = ['ja', 'ja-jp', 'zh', 'zh-cn', 'zh-hk'].includes(language) ? (lastName || firstName) : (firstName || lastName);
    }
    var welcomeMessage = `${greeting} ${name}, ${translatedLabels.WHAT_WOULD_YOU_LIKE_TO_REVIEW}`;
    api.setState('welcomeMessage', welcomeMessage);
    setUpType();
    setUpRoleData();

    // init load after setting type
    // load initial hierarchy and scores
    let selectedType = api.context.props.selectedType || 'class';

    
    switch(selectedType) {
        case 'service':
            api.data.get_cmdb_service_hierarchy.refresh();
            api.data.get_service_completeness_score.refresh();
            api.data.get_service_compliance_score.refresh();
            api.data.get_service_correctness_score.refresh();
            break;
        case 'group':
            api.data.get_cmdb_groups.refresh();
            api.data.get_group_completeness_score.refresh();
            api.data.get_group_compliance_score.refresh();
            api.data.get_group_correctness_score.refresh();
            break;
        case 'class':
        default:
            api.data.get_cmdb_full_class_hierarchy.refresh();
            api.data.get_all_ci_classes_composite__rest_1.refresh();
            api.data.get_class_completeness_score.refresh();
            api.data.get_class_compliance_score.refresh();
            api.data.get_class_correctness_score.refresh();
            break;
    }

    function setUpType() {
        let selectedType = api.context.props.selectedType || 'class';
        api.setState('selectedType', selectedType);
    }

    function setUpRoleData() {
        let userHasCmdbAdmin = api.context.session.user.roles.includes('sn_cmdb_admin');
        let userHasAdmin = api.context.session.user.roles.includes('admin');
        let userHasMaint = api.context.session.user.roles.includes('maint');
        api.setState('isAdminUser', userHasCmdbAdmin || userHasAdmin || userHasMaint);
    }
}
