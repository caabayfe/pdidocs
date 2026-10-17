var SPMFoundationConstants = Class.create();
SPMFoundationConstants.prototype = {
    initialize: function() {

    },
    PORTFOLIO_TABLE: 'spm_service_portfolio',
    LAYER_TABLE: 'spm_taxonomy_layer_definition',
    LAYER: 'spm_taxonomy_layer',
    TAXONOMY_TABLE: 'spm_taxonomy_node',
    CAT_ITEM_SUBSCRIBE_TABLE: 'sc_cat_item_subscribe_mtom',
    SC_REQ_ITEM_TABLE: 'sc_req_item',
    SERVICE_OFFERING_TABLE: 'service_offering',
    CMDB_OUTAGE_CI_MTOM_TABLE: 'cmdb_outage_ci_mtom',
    SERVICE_TABLE: 'cmdb_ci_service',
    PHASE_CATALOG: 'catalog',
    NAME: 'name',
    PARENT: 'parent',
    BUSINESS_CRITICALITY: 'busines_criticality',
    OWNED_BY: 'owned_by',
    DELIVERY_MANAGER: 'delivery_manager',
    DELEGATE: 'service_owner_delegate',
    STATE: 'state',
    DRAFT_STATE: 'draft',
    PUBLISHING_STATE: 'publishing',
    PUBLISHED_STATE: 'published',
    TABLE_NAMES: {
        'service_offering': 'Offering',
        'cmdb_ci_service_business': 'Business Service',
        'cmdb_ci_service_technical': 'Technology Management Services'
    },
    SERVICE_SUBSCRIBE_SYS_USER: "service_subscribe_sys_user",
    SERVICE_SUBSCRIBE_SYS_USER_GRP: "service_subscribe_sys_user_grp",
    SERVICE_SUBSCRIBE_DEPARTMENT: "service_subscribe_department",
    SERVICE_SUBSCRIBE_LOCATION: "service_subscribe_location",
    SERVICE_SUBSCRIBE_COMPANY: "service_subscribe_company",
    STANDARD_PORTFOLIO_CONSTRUCT_PROPERTY: "standard_portfolio_construct.turn_on",

    type: 'SPMFoundationConstants'
};
