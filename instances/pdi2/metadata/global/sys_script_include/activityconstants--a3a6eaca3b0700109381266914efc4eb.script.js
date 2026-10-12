var ActivityConstants = Class.create();
ActivityConstants.prototype = {
    initialize: function() {

    },

    type: 'ActivityConstants'
};

//Tables
ActivityConstants.TABLE_ACTIVITY = "sn_actsub_activity";
ActivityConstants.TABLE_ACTIVITY_CONTEXT = "sn_actsub_activity_context";
ActivityConstants.TABLE_ACTIVITY_TYPE = "sn_actsub_activity_type";
ActivityConstants.TABLE_ACTIVITY_FACET = "sn_actsub_facet";
ActivityConstants.TABLE_M2M_CONTEXT_SUBOBJECT = "sn_actsub_m2m_context_subobject";
ActivityConstants.TABLE_M2M_SUBOBJECT_ACTIVITY_TYPE = "sn_actsub_m2m_subobject_activitytype";
ActivityConstants.TABLE_SOURCE_CONTEXT_MAPPING = "sn_actsub_source_context_mapping";
ActivityConstants.TABLE_ACTIVITY_TYPE_TEMPLATE = "sn_actsub_activitytype_template";
ActivityConstants.TABLE_ACTIVITY_TYPE_TEMPLATE_FIELD = "sn_actsub_activitytype_template_field";

//Template source types
ActivityConstants.TYPE_ACTIVITY_SOURCE_TABLE = "activity_source_table";
ActivityConstants.TYPE_ACTIVITY_GROUP_TABLE = "activity_group_table";

//Facet types
ActivityConstants.DYNAMIC_FACET = "dynamic";
ActivityConstants.STATIC_FACET = "static";

//Services
ActivityConstants.ACTIVITY_FACET_SERVCE = "ACTIVITY_FACET_SERVCE";
ActivityConstants.ACTIVITY_SERVICE = "ACTIVITY_SERVICE";
ActivityConstants.SUBSCRIPTION_SERVICE = "SUBSCRIPTION_SERVICE";
ActivityConstants.ACTIVITY_CONTEXT_SERVICE = "ACTIVITY_CONTEXT_SERVICE";
ActivityConstants.DEFLECTION_CONTEXT_SERVICE = "DEFLECTION_CONTEXT_SERVICE";

ActivityConstants.ACTIVITY_STREAM_PULL_SERVICE = "ACTIVITY_STREAM_PULL_SERVICE";

//Template field position
ActivityConstants.POSITION_SUB_HEADER = "sub_header";
ActivityConstants.POSITION_CONTENT = "content";

// Activity Context Cache Catalogs
ActivityConstants.CACHE_CATALOG_ACTIVITY_GROUPS = "ACTSUB_ACTIVITY_GROUPS";
ActivityConstants.CACHE_CATALOG_ACTIVITY_TYPES = "ACTSUB_ACTIVITY_TYPES";
ActivityConstants.CACHE_CATALOG_ACTIVITY_SOURCE_MAPPINGS = "ACTSUB_ACTIVITY_SOURCE_MAPPINGS";


//Context Cache keys
ActivityConstants.ACTIVITY_GROUPS_KEY = "actsub_activity_groups";
ActivityConstants.ACTIVITY_TYPES_KEY = "actsub_activity_types";
ActivityConstants.ACTIVITY_SOURCE_MAPPING_KEY = "actsub_activity_source_mapping";
ActivityConstants.ACTIVITY_PAGINATION_LOCATION_KEY = "actsub_activity_pagination_location";

//Activity Types
ActivityConstants.CUSTOMER_CASE_CREATED_TYPE = "baf0aace73530010e37d71ef64f6a748";
ActivityConstants.CUSTOMER_CHAT_TYPE = "663af19e73530010e37d71ef64f6a759";
ActivityConstants.CUSTOMER_CALLED_TYPE = "63f7a6c273930010e37d71ef64f6a7e7";
ActivityConstants.CONSUMER_CHAT_TYPE = "94787ba5737f4010e37d71ef64f6a775";
ActivityConstants.CONSUMER_CALLED_TYPE = "e4c7f3a5737f4010e37d71ef64f6a7dd";
ActivityConstants.CUSTOMER_VIEWED_KNOWLEDGE_TYPE = "4a8c329273d30010e37d71ef64f6a7c1";
ActivityConstants.CUSTOMER_CONTRACT_TYPE = "328e72d273d30010e37d71ef64f6a726";
ActivityConstants.CUSTOMER_ENTITLEMENT_TYPE = "fd2ff6d273d30010e37d71ef64f6a7be";
ActivityConstants.CONSUMER_CASE_CREATED_TYPE = "663e5b6e73970010e37d71ef64f6a7a3";
ActivityConstants.CONSUMER_CONTRACT_TYPE = "d281ebee73970010e37d71ef64f6a7ec";
ActivityConstants.CONSUMER_ENTITLEMENT_TYPE = "8be1afee73970010e37d71ef64f6a76d";

ActivityConstants.VIEW_CUSTOMER_CENTRAL = "customer_central";
ActivityConstants.VIEW_SELF_SERVICE_ANALYTICS = "self_service_analytics";

//Properties
ActivityConstants.USER_STREAM_LIMIT = "com.snc.actsub.activity.stream.user.limit";
ActivityConstants.DISABLE_PLUGIN = "com.snc.actsub.core.disable_plugin";

//CRUD
ActivityConstants.CREATE = "create";
ActivityConstants.READ = "read";
ActivityConstants.WRITE = "write";
ActivityConstants.DELETE = "delete";
