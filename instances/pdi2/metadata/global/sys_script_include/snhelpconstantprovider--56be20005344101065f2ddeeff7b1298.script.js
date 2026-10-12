var SNHelpConstantProvider = Class.create();
SNHelpConstantProvider.prototype = {
    initialize: function() {},
    tables: {
        guidance: 'help_guidance',
        guidance_step: 'help_guidance_step',
        content: 'help_content',
        question: 'help_question',
        answer: 'help_answer',
        user_interaction: 'help_user_interaction',
        user_interaction_step: 'help_user_interaction_step',
        eh_content: 'sys_embedded_help_content',
        m2m_step_dependency: 'help_m2m_step_dependency',
        setup_dependency: 'help_setup_dependency',
        sys_translated_text: 'sys_translated_text'
    },
    //constant to identify if content is default content or not
    IS_DEFAULT_CONTENT: 'is_default_content',

    actions: {
        NEXT: 'next',
        PREVIOUS: 'prev',
        SKIP: 'skip',
        SUBMIT: 'submit',
        CLOSED: 'closed'
    },

    status: {
        IN_TRANSIT: 'in_transit',
        IN_PROGRESS: 'in_progress',
        SKIPPED: 'skipped',
        ABANDONED: 'abandoned',
        COMPLETE: 'completed'
    },

    httpStatus: {
        //DEF0409397: To avoid test failures, we are making status code to 200 as temporary fix
        BAD_REQUEST: 200,
        NOT_FOUND: 200,
        SUCCESS: 200,
        INTERNAL_ERROR: 500,
        FORBIDDEN: 403
    },

    stepLayout: {
        IMAGE: "image",
        VIDEO: "video",
        TEXT: "text",
        QUESTION: "question",
        IMAGE_TEXT: "image_text",
        IMAGE_QUESTION: "image_question"
    },

    tableColumns: {
        guidance_step: "guidance_step",
        question: "question",
        guidance: "guidance",
        curr_step: "current_step",
        user_interaction: "user_interaction",
        order: "order",
        content: "content",
        documentKey: "documentkey",
        language: "language",
        sys_id: "sys_id",
        eh_content: "eh_content",
        ai_generated: "ai_generated"
    },

    errorMessages: {
        empty_sys_id: gs.getMessage("Provide a sys_id "),
        no_records: gs.getMessage("No records found "),
        invalid_sys_id: gs.getMessage("Invalid sys_id"),
        draft_sys_id: gs.getMessage("Guidance is not published. Please contact your system administrator for help.")
    },

    restAPIKeys: {
        content: ["sys_id", "title", "footer", "actions_label", "video_link", "image", "image_link", "text", "custom_html", "subtitle", "questions", "has_custom_html", "has_image_link", "image_alt", "video_alt"],
        question: ["sys_id", "type", "variant", "question", "mandatory", "answers"],
        guidance_step: ["sys_id", "layout", "skippable", "actions_label", "order", "content"],
        guidance: ["sys_id", "name", "context", "status", "type", "steps", "active", "roles"],
        answer: ["label", "value", "sys_id"],
        document: ["sys_id", "name", "roles", "description", "snc_created", "type", "status", "order", "eh_content", "topic_id", "version", "is_default_content", "language", "ai_generated"],
        eh_content: ["sys_id", "category", "content"],
        resource: ["sys_id", "title", "image", "image_link", "custom_html", "subtitle", "image_alt", "type", "options", "resource_id", "version"],
        setup: ["active", "description", "name", "roles", "snc_created", "status", "sys_id", "type", "version", "checklist", "order"],
        setupStep: ["description", "guidance", "has_decision", "layout", "name", "order", "parent", "skippable", "sys_decision", "sys_id", "type", "unlock_by_decision_step", "status"],
        setupContent: ["configuration_types", "custom_html", "default_content", "field_name", "filter", "guidance_step", "has_custom_html", "image", "image_alt", "image_link", "open_in", "options", "records", "related_content", "subtitle", "sys_id", "table_name", "text", "title", "type", "version", "video_alt", "video_link", "related_content", "order"],
        interaction: ["answers", "current_step", "guidance", "status", "sys_id", "timestamp", "user", "active_setup_type", "applicable_steps"],
        interactionStep: ["action", "options", "related_user_interaction_step", "status", "step", "sys_id", "user", "user_interaction"],
        related_content: ["image", "image_alt", "image_link", "subtitle", "sys_id", "title", "type", "url", "video_alt", "video_link"]
    },

    setupType: {
        GLOBAL_SETUP: 'global_setup',
        PERSONAL_SETUP: 'personal_setup'
    },

    // REST API Keys specific to callout
    calloutRestKeys: {
        step: ["target_element"],
    },

    guidanceType: {
        CALLOUT: "callout",
        MODAL: "modal",
    },
    questionType: ["question", "image_question"],
    survey: "survey",
    separator: "/",
    emptyPanelMessage: gs.getMessage(gs.getProperty("com.glide.sn_help.empty_panel.message")),
    showPanelFeedback: gs.getProperty("com.glide.sn_help.panel.show_feedback"),
    snHelpDisabled: gs.getMessage("API ACCESS ERROR: This capability has been disabled on your instance. Please contact your system administrator"),
    SN_ALL: "sn_all", // Constant used to display content in all workspace pages
	DEFAULT_LANGUAGE : "en",
	MACHINE_TRANSLATED : "mt",
	HUMAN_TRANSLATED : "ht",
    type: 'SNHelpConstantProvider'
};
