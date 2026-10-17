var SNHelpSetupConstantProvider = Class.create();
SNHelpSetupConstantProvider.prototype = {
    initialize: function() {
    },
	
	tables : {
		guidance: 'help_guidance',
		guidance_step: 'help_guidance_step',
		content: 'help_content',
		question: 'help_question',
		answer: 'help_answer',
		user_interaction: 'help_user_interaction',
		user_interaction_step: 'help_user_interaction_step',
		user_interaction_log: 'help_user_interaction_log',
		eh_content : 'sys_embedded_help_content',
		m2m_step_dependency : 'help_m2m_step_dependency',
		setup_dependency : 'help_setup_dependency',
		plugin: 'v_plugin'
	},

	views : {
		configure_products_list: 'sn_ads_setup_configure_products_list',
		guidance_snapshot_view: 'sn_ads_setup_guidance_snapshot_view',
		in_progress_setup_view: 'in_progress_setup_view'
	},

	status: {
		IN_TRANSIT: 'in_transit',
		IN_PROGRESS: 'in_progress',
		SKIPPED: 'skipped',
		ABANDONED: 'abandoned',
		COMPLETE: 'completed',
		NOTSTARTED: 'not_started',
		AUTOCOMPLETE: 'auto_completed'
	},

	executionTypes: {
		SINGLE: 'single',
		MULTIPLE: 'multiple'
	},

	tableColumns : {
		guidance_step: "guidance_step",
		question: "question",
		guidance: "guidance",
		curr_step: "current_step",
		user_interaction: "user_interaction",
		order: "order",
		content: "content",
	},

	errorMessages: {
		empty_sys_id : "Provide a sys_id",
		no_records: "No records found",
		invalid_sys_id: "Invalid sys_id",
	},

	restAPIKeys: {
		content: [ "sys_id", "title", "footer", "actions_label", "video_link", "image", "image_link", "text", "custom_html", "subtitle", "questions", "has_custom_html", "has_image_link", "image_alt", "video_alt", "type", "url"],
		question: [ "sys_id", "type", "variant", "question", "mandatory", "answers", "sys_updated_on" ],
		guidance_step: [ "sys_id", "layout", "skippable", "actions_label", "order", "content", "task_type" ],
		guidance: [ "sys_id", "name", "context", "status", "type", "steps", "active", "roles" ],
		answer:  [ "label", "value", "sys_id" ],
		document : ["sys_id", "name", "description", "snc_created", "type", "status", "order", "eh_content", "topic_id", "version"],
		eh_content : ["sys_id", "category", "content"],
		resource : ["sys_id", "title", "image", "image_link", "custom_html", "subtitle", "image_alt", "type", "options", "resource_id", "version"],
		setup : ["active", "description", "name", "roles", "snc_created", "status", "sys_id", "type", "version", "checklist", "order", "sys_scope"],
		setupStep : ["description", "guidance", "has_decision", "layout", "name", "order", "parent", "skippable", "sys_decision", "sys_id", "type", "unlock_by_decision_step", "status", "task_type", "related_content", "rich_description"],
		setupContent : ["sys_id", "title", "records", "configuration_types", "type", "table_name", "field_name", "view", "url", "related_content", "guidance_step"],
		interaction : ["answers", "current_step", "guidance", "status", "sys_id", "timestamp", "user", "active_setup_type", "applicable_steps", "sys_updated_on"],
		interactionStep : ["action", "options", "related_user_interaction_step", "status", "step", "sys_id", "user", "user_interaction", "sys_updated_on"],
		related_content : [ "sys_id", "title", "records", "configuration_types", "type", "table_name", "text", "field_name", "view", "url", "related_content"],
		plugin: ["id", "name", "active"],
		dependencies: ["id", "name", "parent", "order"]
	},
	
	setupType : {
		GLOBAL_SETUP : 'global_setup',
		PERSONAL_SETUP : 'personal_setup'
	},
	
	taskType: {
		BASIC: 'basic',
		RECOMMENDED: 'recommended',
		ADVANCED: 'advanced'
	},
	
	questionType : ["question", "image_question"],
	survey : "survey",
	separator : "/",
	showPanelFeedback : gs.getProperty("com.glide.sn_help.panel.show_feedback"),
	snHelpDisabled : "API ACCESS ERROR: This capability has been disabled on your instance. Please contact your system administrator",
	
	playType: {
		quick: 'Quick start',
		best_exp: 'Best experience',
		custom: 'Custom'
	},
	
	playTypeToStepType: {
		quick: 'basic',
		best_exp: 'recommended',
		custom: 'advanced'
	},
	
	statusToLabel: {
		
		in_transit: 'In Transit',
		in_progress: 'In Progress',
		skipped: 'Skipped',
		abandoned: 'Abandoned',
		completed: 'Completed',
		not_started: 'Not Started',
		auto_completed: 'Auto Completed'
	},
	
	stepStatusToLabel: {
		'0': 'Completed',
		'1': 'Not Started',
		'2': 'In Progress',
		'3': 'In Progress'
	},
	
    stepType: {
        GROUP: "group",
        DEFAULT: "default",
        ACTIVITY: "activity",
        SURVEY: "survey"
    },

	gsTaskType: {
        EXTERNAL_LINK: "custom",
        IFRAME: "iframe",
        TABLE: "table",
        PLUGINS: "install_plugin"
    },

    activityDefId: {
        EXTERNAL_LINK: "3ac69e4e4337311050286548b9b8f244",
        IFRAME: "fcbbb246eb7331107626211f1a522853",
        TABLE: "f16277690703001070e493d0fad30018",
        PLUGINS: "f0c4e20543c1021050286548b9b8f270",
		INSTRUCTION: "b0c35e2b1b630010affd0e55cc4bcbca"
    },

    activityStartRule: {
        IMMEDIATE: "ef8ab8c0a3f04bceb117263f51401070",
        AFTER_ACTIVITY: "7abaf173c35101102a86cb03b940dd62",
    },

    laneStartRule: {
        IMMEDIATE: "b823830967fc41ddb84959d97897b1ae"
    },

	triggerType: {
		CREATE_OR_UPDATE: "789911170f1200108c87f4f0ff767e27"
	},

	setupStatus: {
		DRAFT: 'draft',
		PUBLISHED: 'published'
	},

	pluginName: 'Plugins',

    type: 'SNHelpSetupConstantProvider'
};
