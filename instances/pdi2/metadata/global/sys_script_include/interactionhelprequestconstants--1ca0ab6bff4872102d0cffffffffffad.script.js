/**
 * Constants for Interaction Help Request functionality.
 * Defines table names, field names, access types, and state values used across help request operations.
 */
var InteractionHelpRequestConstants = Class.create();
InteractionHelpRequestConstants.TABLE_INTERACTION = 'interaction';
InteractionHelpRequestConstants.TABLE_INTERACTION_HELP_REQUEST = 'interaction_help_request';
InteractionHelpRequestConstants.FIELD_REQUESTED_BY = 'requested_by';
InteractionHelpRequestConstants.FIELD_PROVIDED_BY = 'provided_by';
InteractionHelpRequestConstants.ACCESS_READ = 'read';
InteractionHelpRequestConstants.ACCESS_WRITE = 'write';
InteractionHelpRequestConstants.TABLE_INTERACTION_HELP_REQUEST_REASON = 'interaction_help_request_reason';
InteractionHelpRequestConstants.HELP_REQUEST_FIELD_INTERACTION = 'interaction';
InteractionHelpRequestConstants.HELP_REQUEST_CANCELLED = 'cancelled';
InteractionHelpRequestConstants.HELP_REQUEST_REASON_SYSID = 'sys_id';
InteractionHelpRequestConstants.HELP_REQUEST_REASON_CODE = 'code';
InteractionHelpRequestConstants.TABLE_SUPERVISOR_HELP_ACTION = 'supervisor_help_action';
InteractionHelpRequestConstants.SUPERVISOR_HELP_ACTION_FIELD_INTERACTION = 'interaction';
InteractionHelpRequestConstants.SUPERVISOR_HELP_ACTION_FIELD_END_TIME = 'end_time';
