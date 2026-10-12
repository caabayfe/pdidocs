var SSAConstants = Class.create();
SSAConstants.prototype = {
    initialize: function() {
    },

    type: 'SSAConstants'
};

SSAConstants.TABLE_PATTERN_ELEMENT = 'ssa_pattern_element';
SSAConstants.TABLE_PATTERN_ELEMENT_GROUP = 'ssa_pattern_element_group';
SSAConstants.TABLE_ELEMENT_BASE = 'ssa_element_base';
SSAConstants.TABLE_ACTIVITY_PATTERN = 'ssa_activity_pattern';
SSAConstants.TABLE_PATTERN_ELEMENT_MAPPING = 'ssa_pattern_m2m_element';
SSAConstants.TABLE_DEFLECTION_CONFIGURATION= 'ssa_deflection_configuration';
SSAConstants.TABLE_DEFLECTION_PATTERN = 'ssa_deflection_pattern';
SSAConstants.TABLE_DEFLECTION_METRIC = 'ssa_deflection_metric';
SSAConstants.TABLE_DEFLECTION_METRIC_ACTIVITY = 'ssa_deflection_metric_activity';

SSAConstants.AND_OPERATOR = "10";
SSAConstants.OR_OPERATOR = "20";
SSAConstants.OCCURRENCE_ONCE = "10";
SSAConstants.OCCURRENCE_OPTIONALLY_ONCE = "20";
SSAConstants.OCCURRENCE_OPTIONALLY_MANY = "30";
SSAConstants.OCCURRENCE_ATLEAST_ONCE = "40";
SSAConstants.OCCURRENCE_RANGE = "50";
SSAConstants.MATCH_IF_FOUND = "1";
SSAConstants.MATCH_IF_NOT_FOUND = "0";
SSAConstants.REP_ID_LENGTH = 5;
SSAConstants.REP_ID_DELIMITER = '-';
