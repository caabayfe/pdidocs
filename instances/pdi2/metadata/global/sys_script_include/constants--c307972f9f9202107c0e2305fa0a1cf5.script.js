var Constants = Class.create();

Constants.fields = {
    GEN_AI_RESOURCE_MAPPING__CAPABILITY : "Capability",
    GEN_AI_RESOURCE_MAPPING__GEN_AI_RESOURCE : "Resource",
    GEN_AI_RESOURCE_MAPPING__ACTIVE : "Active",
    ONE_EXTEND_RESOURCE_PARAM_VALUE__RESOURCE_MAPPING : "Resource Mapping",
    ONE_EXTEND_RESOURCE_PARAM_VALUE__PARAM_NAME : "Param Name",
    ONE_EXTEND_RESOURCE_PARAM_VALUE__PARAM_VALUE : "Param Value",
    ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_MAPPING : "Resource Mapping",
    ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_PARAM_NAME : "Resource Param Name",
    ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_ATTRIBUTE_NAME : "Resource Attribute Name",
    ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_ATTRIBUTE_VALUE: "Resource Attribute Value",
    ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_PARAM_VALUE : "Resource Param Value",
    ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__SCRIPT : "Script",
    ONE_EXTEND_DEPENDENCY_MAPPING__PARENT_CAPABILITY : "Parent Capability",
    ONE_EXTEND_DEPENDENCY_MAPPING__RESOURCE : "Capability / Resource",
    ONE_EXTEND_DEPENDENCY_MAPPING__CONDITIONS : "Conditions",
    ONE_EXTEND_DEPENDENCY_MAPPING__CONDITION_SCRIPT : "Condition Script",
    ONE_EXTEND_DEPENDENCY_MAPPING__ERROR_POLICY : "Error Policy",
    ONE_EXTEND_DEPENDENCY_MAPPING__ERROR_HANDLER : "Error Handler",
    ONE_EXTEND_DEPENDENCY_MAPPING__ACTIVE : "Active",
    ONE_EXTEND_CAPABILITY__CAPABILITY : "capability",
    ONE_EXTEND_CAPABILITY__ACTIVE : "ctive",
    ONE_EXTEND_CAPABILITY__RESOURCE_TYPE : "resource_type",
    ONE_EXTEND_CAPABILITY_DEFINITION__NAME : "name",
    ONE_EXTEND_CAPABILITY_DEFINITION__CAPABILITY : "capability",
    ONE_EXTEND_CAPABILITY_DEFINITION__API_TYPE : "api_type",
    ONE_EXTEND_CAPABILITY_DEFINITION__API : "api",
    ONE_EXTEND_CAPABILITY_DEFINITION__CATEGORY : "category",
    ONE_EXTEND_CAPABILITY_DEFINITION__CONNECTION : "connection",
    ONE_EXTEND_CAPABILITY_DEFINITION__DESCRIPTION : "description",
    ONE_EXTEND_CAPABILITY_DEFINITION__FILTER_PROPERTIES : "filter_properties",
    ONE_EXTEND_CAPABILITY_DEFINITION__ADVANCED : "advanced",
    ONE_EXTEND_CAPABILITY_DEFINITION__TRUNCATE_STRATEGY : "truncate_strategy",
    ONE_EXTEND_CAPABILITY_DEFINITION__PREPROCESSOR : "preprocessor",
    ONE_EXTEND_CAPABILITY_DEFINITION__POSTPROCESSOR : "postprocessor",
    ONE_EXTEND_CAPABILITY_DEFINITION__SYS_DOMAIN : "sys_domain",
    SYS_ID: "sys_id",

};

Constants.tables = {
    GEN_AI_RESOURCE_MAPPING : "sys_gen_ai_resource_mapping",
    ONE_EXTEND_RESOURCE_PARAM_VALUE : "sys_one_extend_resource_param_value",
    ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING : "sys_one_extend_resource_attribute_mapping",
    ONE_EXTEND_DEPENDENCY_MAPPING : "sys_one_extend_dependency_mapping",
    ONE_EXTEND_CAPABILITY: "sys_one_extend_capability",
    ONE_EXTEND_CAPABILITY_DEFINITION : ""
};


Constants.ERROR_CODE = "errorCode";
Constants.ERROR_MESSAGE = "errorMessage";
Constants.IS_ERROR = "isError";
Constants.MESSAGE = "message";
Constants.STATUS = "status";
Constants.SUCCESS = "success";
Constants.ERROR = "error";
Constants.DATA = "data";
Constants.TABLE = "table";
Constants.FILTER = "filter";
Constants.DOT = ".";
Constants.SPACE = " ";
Constants.CUSTOM = "custom";

Constants.SCHEMA = "schema";
Constants.SCHEMA__TYPE = "type";
Constants.SCHEMA__TABLE_NAME = "tableName";
Constants.SCHEMA__TYPE__REFERENCE = "reference";
Constants.SCHEMA__TYPE__STRING = "string";

Constants.prototype = {
    initialize: function() {},

    type: 'Constants'
};
