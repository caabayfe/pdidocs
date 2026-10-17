var RequestConstants = Class.create();
RequestConstants.prototype = {
    initialize: function() {},
    type: 'RequestConstants'
};

// TABLES
RequestConstants.TABLES = {
    REQUEST_SOURCE: "sn_ex_sp_request_source",
    REQUEST_FILTER_DEFINITION: "sn_ex_sp_request_filter_definition",
    REQUEST_FILTER_CONFIG: "sn_ex_sp_request_filter_config",
    REQUEST_FILTER_CONDITION: "sn_ex_sp_request_filter_conditions",
    TASK: "task",
    CART_ITEM: "sc_cart_item"
};

// DEFINITION FILTER TYPES 
RequestConstants.FILTER_TYPES = {
    CHOICE: "choice",
    REFERENCE: "reference"
};

// DEFINITION FILTER SELECT TYPES {single or multi}
RequestConstants.FILTER_SELECT_TYPES = {
    SINGLE: "single",
    MULTI: "multi"
}; 

// CACHE
RequestConstants.SCOPED_CACHE_NAME = "employee_center_requests";
RequestConstants.SESSION_CACHE_KEYS = {
    VIEW_FILTER : 'employee_center_requests_view_filter',
    REQUEST_FILTER : 'employee_center_requests_filter'
};
