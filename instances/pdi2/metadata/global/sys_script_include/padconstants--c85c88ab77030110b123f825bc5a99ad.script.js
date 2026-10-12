var PADConstants = Class.create();
PADConstants.prototype = {
    initialize: function() {},
    type: 'PADConstants'
};

PADConstants.TABLES = {
	PD_ACTIVITY: 'sys_pd_activity',
	PD_ACTIVITY_DEFINITION: 'sys_pd_activity_definition',
	PD_LANE: 'sys_pd_lane',
	PD_PROCESS_DEFINITION: 'sys_pd_process_definition',
	PD_TRIGGER_INSTANCE: 'sys_pd_trigger_instance',
	PD_TIMER_ATTRIBUTE: 'sys_pd_timer_attributes',
	PD_GENERATION_CONTEXT: 'sys_pd_generation_context',
	GEN_AI_SKILL: 'sys_gen_ai_skill',
};

PADConstants.ROLES = {
	ACTION_DESIGNER_ROLE: 'action_designer',
	ADMIN_ROLE: 'admin',
	PD_ADMIN_ROLE: 'playbook.admin',
	PLAYBOOK_WRITE: 'playbook.write',
	PD_OPERATOR: 'pd_operator',
	CONTENT_AUTHOR_ROLE: 'pd_content_author',
	PD_TRIGGER_AUTHOR: 'pd_trigger_author',
	PD_SHARED_ADMIN: 'pd_shared.admin',
	PD_SHARED_USER: 'pd_shared.user',
	DELEGATED_DEV_ROLE: 'delegated_developer',
	NOW_ASSIST_CREATOR: 'now.assist.creator',
	MAINT_ROLE: 'maint',
	PLAYBOOK_WRITE_PUBLIC_ACCESS: 'playbook.write.public_access',
	PLAYBOOK_CONTENT_AUTHOR_PUBLIC_ACCESS: 'playbook.content_author.public_access'
};

PADConstants.Shared = {
	TRIGGER_INPUT: 'trigger_inputs'
};

PADConstants.Errors = {
	UNAUTHORIZED: 'UNAUTHORIZED',
	GENERIC_ERROR: 'GENERIC_ERROR',
	UPDATE_FAILED: 'UPDATE_FAILED',
	UPGRADE_IN_PROGRESS: 'UPGRADE_IN_PROGRESS',
	RECORD_NOT_FOUND: 'RECORD_NOT_FOUND'
};

PADConstants.Errors.Messages = {
	UNAUTHORIZED: gs.getMessage('You are unauthorized to perform this action.'),
	UPGRADE_IN_PROGRESS: gs.getMessage('A system upgrade is in progress. Updates cannot be made during an upgrade. Please try again later.'),
	INVALID_ARGUMENT: gs.getMessage('A required argument is missing or invalid.'),
	RECORD_NOT_FOUND: gs.getMessage('We cannot find a record that matches your request.'),
	FETCH_SKILL_METADATA_FAILED: gs.getMessage('skillId is required to fetch skill metadata.')
};

PADConstants.RecordNotFoundError = {
	errorType: PADConstants.Errors.RECORD_NOT_FOUND,
	message: PADConstants.Errors.Messages.RECORD_NOT_FOUND
};

PADConstants.FetchSkillMetaDataFailedError = {
	errorType: 'QUERY_FAILED',
	message: PADConstants.Errors.Messages.FETCH_SKILL_METADATA_FAILED
};

PADConstants.UnauthorizedError =  {
	errorType: PADConstants.Errors.UNAUTHORIZED,
	message: PADConstants.Errors.Messages.UNAUTHORIZED
};

PADConstants.UpgradeError =  {
	errorType: PADConstants.Errors.UPGRADE_IN_PROGRESS,
	message: PADConstants.Errors.Messages.UPGRADE_IN_PROGRESS
};

PADConstants.viewTypes = {
	KANBAN: 'KANBAN',
	DIAGRAM: 'DIAGRAM'
};

PADConstants.laneStartRules = {
	IMMEDIATE: {
		sysId: 'b823830967fc41ddb84959d97897b1ae',
		name: 'immediate'
	},
	AFTER_PREVIOUS: {
		sysId: '3f030dc5bd8842aebc1fa64716545da2',
		name: 'after_previous'
	},
	WITH_PREVIOUS: {
		sysId: 'aed74dc26c714cb3a1d3ed263a04b3da',
		name: 'with_previous'
	},
	MANUAL: {
		sysId: 'ada8160ec3202010f5bfea1c8d40ddbd',
		name: 'manual'
	},
	AFTER_LANES: {
		sysId: '7407ca1ac3e02110f1f504186e40dd50',
		name: 'after_lanes'
	}
};

PADConstants.activityStartRules = {
    IMMEDIATE: {
		sysId: 'ef8ab8c0a3f04bceb117263f51401070',
		name: 'immediate'
	},
	AFTER_PREVIOUS: {
		sysId: 'eb98b4955ba74acab978af26ad083f61',
		name: 'after_previous'
	},
	WITH_PREVIOUS: {
		sysId: '7c1ac084f80d4ed9be5a7b3df939463b',
		name: 'with_previous'
	},
	AFTER_ACTIVITIES: {
		sysId: '7abaf173c35101102a86cb03b940dd62',
		name: 'after_activities'
	},
	MANUAL: {
		sysId: 'b4727ca5c3602010f5bfea1c8d40dda9',
		name: 'manual'
	}
};

PADConstants.PLUGINS = {
    NOW_ASSIST_FOR_PLAYBOOK: 'sn_assist_playbook'
};

PADConstants.diagramStartRuleNames = [
	PADConstants.activityStartRules['IMMEDIATE'].name,
	PADConstants.activityStartRules['AFTER_ACTIVITIES'].name
];

PADConstants.kanbanStartRuleNames = [
	PADConstants.activityStartRules['IMMEDIATE'].name,
	PADConstants.activityStartRules['AFTER_PREVIOUS'].name,
	PADConstants.activityStartRules['WITH_PREVIOUS'].name,
	PADConstants.activityStartRules['MANUAL'].name
];

PADConstants.v2ActivityStartRuleNames = [
	PADConstants.activityStartRules['IMMEDIATE'].name,
	PADConstants.activityStartRules['AFTER_ACTIVITIES'].name,
	PADConstants.activityStartRules['MANUAL'].name
];

PADConstants.v1LaneStartRuleNames = [
	PADConstants.laneStartRules['IMMEDIATE'].name,
	PADConstants.laneStartRules['AFTER_PREVIOUS'].name,
	PADConstants.laneStartRules['WITH_PREVIOUS'].name,
	PADConstants.laneStartRules['MANUAL'].name
];

PADConstants.v2LaneStartRuleNames = [
	PADConstants.laneStartRules['IMMEDIATE'].name,
	PADConstants.laneStartRules['AFTER_LANES'].name,
	PADConstants.laneStartRules['MANUAL'].name
];

PADConstants.STANDARD_PROCESS_TYPE_SYS_ID = '52c6d3eeff1be2102c2fffffffffff44';

PADConstants.permissionConstants = {
    defaultPermissionPlaybook: {
        READ: [{
            source: "RECORD_READ_ACCESS",
            mapping: "{{pd.inputRecord}}",
            required: true
        }],
        LANE_ADD_OPTIONAL_ACTIVITY: [{
            source: 'RECORD_WRITE_ACCESS',
            mapping: '{{pd.inputRecord}}',
            required: true
        }],
        RESTART: [{
            source: 'RECORD_WRITE_ACCESS',
            mapping: '{{pd.inputRecord}}',
            required: true
        }],
        LANE_RESTART: [{
            source: 'RECORD_WRITE_ACCESS',
            mapping: '{{pd.inputRecord}}',
            required: true
        }],
        CANCEL: [{
            source: 'RECORD_WRITE_ACCESS',
            mapping: '{{pd.inputRecord}}',
            required: true
        }],
        ACTIVITY_RESTART: [{
            source: 'RECORD_WRITE_ACCESS',
            mapping: '{{pd.inputRecord}}',
            required: true
        }]
    }
};
