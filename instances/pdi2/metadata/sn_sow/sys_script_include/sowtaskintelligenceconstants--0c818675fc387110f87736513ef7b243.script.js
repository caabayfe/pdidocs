var SOWTaskIntelligenceConstants = Class.create();
SOWTaskIntelligenceConstants.prototype = {
    initialize: function() {},
    type: 'SOWTaskIntelligenceConstants'
};

SOWTaskIntelligenceConstants.UI_EXTENSION_POINT = "sn_sow.SOWTaskIntelligenceForms";
SOWTaskIntelligenceConstants.PREDICTED_FIELDS_TO_EXCLUDE = [];
SOWTaskIntelligenceConstants.LOG_TABLE = "sys_generative_ai_log";

SOWTaskIntelligenceConstants.UI_MESSAGES = {
    "RECOMMENDED": gs.getMessage("Recommended by AI: {0}"),
    "AI_MESSAGE": gs.getMessage("Predicted by AI"),
    "ICON_DESCRIPTION": gs.getMessage("AI summarized this chat using the transcript of the conversation.")
};

SOWTaskIntelligenceConstants.UI_INFO = {
    'ICON_NAME': "ai_sparkle_fill",
    'ICON_VALUE': "AI",
    'ICON_VARIANT_NAME': "tertiary",
    'ICON_COLOR_NAME': "moderate",
    'ICON_SHOW': "true",
    'ICON_HIDE': "false",
    "SECTION_LABEL": gs.getMessage("Top Recommendation(s)"),
};

// shared
SOWTaskIntelligenceConstants.IMPLEMENTATION_PLANS = {
    "AUTOFILL": "Autofill",
    "RECOMMENDATIONS": "Recommendations"
};

//chat summarization
SOWTaskIntelligenceConstants.PROP_CHAT_SUMMARIZATION_ENABLED = "com.sn.cs.chat.summarization.enabled";
SOWTaskIntelligenceConstants.TBL_INTERACTION = "interaction";

//latest keys for logs
SOWTaskIntelligenceConstants.METADATA_DOCUMENT = "metadata_document";
SOWTaskIntelligenceConstants.METADATA_TABLE = "metadata_table";
SOWTaskIntelligenceConstants.CALLER = "caller";
