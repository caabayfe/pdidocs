var WWNAConstants = Class.create();


WWNAConstants.TABLES = {
    GENERATIVE_AI_PROMPT_CONFIG: 'sys_generative_ai_prompt_config',
    ONE_EXTEND_DEFINITION_CONFIG: 'sys_one_extend_definition_config',
    SKILL_CONFIG: 'sn_nowassist_skill_config',
    WWNA_QUICK_ACTIONS: 'wwna_quick_actions',
    SKILL_CONFIG_STATUS: 'sn_nowassist_skill_config_status'
};

WWNAConstants.ELABORATE_TRUNCATE_INFO = 'WWNA Elaborate Truncation - ';
WWNAConstants.NACM_OPEN_PROMPT_ACTION = 'nacmOpenPromptIntentDetection';
WWNAConstants.MAX_VALUE_FOR_REFINE_COUNT = 5;

WWNAConstants.SELECTED_TEXT_EMPTY = gs.getMessage("Unable to generate the response. Please select Text and Try again.");
WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID = 'f8fdd6ca43520210fbb28b11afb8f226';
WWNAConstants.WWNA_COMMON_CAPABILITY_NAME = 'Now Assist context menu';
WWNAConstants.KNOWLEDGE_GRAPH_CAPABILITY_ID = '6f8aa08c9f301210658df697790a1cd8';
WWNAConstants.WWNA_BASE_ACTION_TABLE = 'sys_one_extend_capability';
WWNAConstants.WWNA_OPEN_PROMPT_ACTION_ID = 'c4e9f80cff652a104d0affffffffff20';
WWNAConstants.WWNA_KNOWLEDGE_GRAPH_ACTION_ID = '049f8c3bff512a104d0affffffffff0f';
WWNAConstants.WWNA_FEATURE_MAPPING_ID = '2d150bc2c3620210609ad7cf05013155';
WWNAConstants.GENERIC_ERROR_MESSAGE = gs.getMessage("There was a problem generating content. Try again later.");
WWNAConstants.GENERIC_OPEN_PROMPT_ERROR_MESSAGE = gs.getMessage("This action isn't available to you");
WWNAConstants.WWNA_MODAL_OUTPUT_PARSING_ERROR_RESPONSE_MESSGAE = gs.getMessage("The response is incomplete due to its length. Please use Now Assist to continue.");
WWNAConstants.GENERIC_NO_DATA_FOUND_MESSAGE = gs.getMessage("No matching data was found. Please check your request and try again.");
WWNAConstants.ONE_EXTEND_STATES = {
    ERROR: "error",
    SUCCESS: "success"
};
WWNAConstants.WWNA_DEFAULT_SKILL_CONFIG_ID = '0e01aa8d932112104d0a423b928918ce';
WWNAConstants.WWNA_CONFIG_TYPE_ID = "8c9697d7a38a421075d1d78446fcda50";
WWNAConstants.WWNA_ADMIN_CONFIG_TYPE_ID = "30b5779c9352d2104d0a423b92891818";
WWNAConstants.WWNA_GENERAL_DETAILS_CONFIG_TYPE_ID = "5a2bfda3935952104d0a423b92891800";
WWNAConstants.WWNA_DUMMY_CONFIG_TYPE_ID = "f2b2e3c593e512104d0a423b9289181f";
WWNAConstants.WWNA_NACM_CONFIG_MAPPING_TYPE_ID = "d6b67a62ff8866104d0affffffffffa2";
WWNAConstants.NAA_OOB_DELIVERY_STEP = '77c599be433071106b5f90cfd7b8f254';
WWNAConstants.ONE_EXTEND_ACL_FAILURE_ERROR_MESSAGE = "Cannot process the one-extend call as the user doesn't have permission to execute this skill";
WWNAConstants.WWNA_ACL_FAILURE_MESSAGE = gs.getMessage('This action is not available for your account');
WWNAConstants.ACTION_TYPES = {
    REFINE: "WWNA: Refine",
    PRESET: "WWNA: Preset",
    DEFAULT: "WWNA: Default"
};

WWNAConstants.CONFIG_TYPE = {
    SINGLE: "single_occurence",
    TABLE: "table_form",
    MULTI: "custom_form"
};

WWNAConstants.CONFIG_TYPE_LIST = [{
    id: WWNAConstants.CONFIG_TYPE.TABLE,
    label: gs.getMessage("Record form fields"),
    helperText: gs.getMessage("Display the trigger as a button next to the field or beside the text cursor for the input fields.")
}, {
    id: WWNAConstants.CONFIG_TYPE.SINGLE,
    label: gs.getMessage("Custom location"),
    helperText: gs.getMessage("Display the trigger as an action button placed somewhere on the page. For workspaces, this requires setup with UI Builder.")
}];

WWNAConstants.VARIANT_TYPE = {
    FIXED: 'fixed',
    DRAGGABLE: 'draggable'
};

WWNAConstants.MODEL_PROVIDERS = {
    NOW_LLM: "now_llm",
    AZURE_OPENAI: "azure_openai",
    AMAZON_BEDROCK: "amazon_bedrock",
    GOOGLE_VERTEX: "google_vertex"
};

WWNAConstants.VARIANT_TYPE_LIST = [{
    id: WWNAConstants.VARIANT_TYPE.DRAGGABLE,
    label: gs.getMessage('Modeless window'),
    helperText: gs.getMessage("A draggable and resizable window that is triggered by selecting the button.")
}, {
    id: WWNAConstants.VARIANT_TYPE.FIXED,
    label: gs.getMessage('Embedded card'),
    helperText: gs.getMessage("In a card that is a fixed part of the page layout.")
}];

WWNAConstants.CONFIG_SUB_TYPE = {
    TABLE: "table_form",
    CUSTOM: "custom_form"
};

WWNAConstants.booleanOptions = [{
    id: "true",
    label: gs.getMessage("Yes")
}, {
    id: "false",
    label: gs.getMessage("No")
}];

WWNAConstants.buttonConfig = {
    size: {
        label: "Size",
        type: "select",
        options: [{
            id: "sm",
            label: gs.getMessage("Small")
        }, {
            id: "md",
            label: gs.getMessage("Medium")
        }, {
            id: "lg",
            label: gs.getMessage("Large")
        }],
        defaultValue: 'md'
    },
    variant: {
        label: "Variant",
        type: "select",
        options: [{
            id: "primary",
            label: gs.getMessage("Primary")
        }, {
            id: "secondary",
            label: gs.getMessage("Secondary")
        }, {
            id: "tertiary",
            label: gs.getMessage("Tertiary")
        }]
    },
    label: {
        label: "Label",
        type: "input",
        defaultValue: ""
    },
    icon: {
        label: "Icon",
        type: "input",
        defaultValue: "ai-sparkle-outline"
    },
    tooltipContent: {
        label: "Tooltip Content",
        type: "input",
        defaultValue: "Test Tooltip"
    },
    isCaretForDropdown: {
        label: "Is Caret Dropdown ?",
        type: "select",
        subType: "boolean",
        options: WWNAConstants.booleanOptions,
        defaultValue: "false"
    },
    strictlyUseDefaultPresetAction: {
        label: "Strictly Use Menu Action ?",
        type: "select",
        subType: "boolean",
        options: WWNAConstants.booleanOptions,
        defaultValue: "false"
    },
    hideButtonOnDialog: {
        label: "Hide Button on Dialog ?",
        type: "select",
        subType: "boolean",
        options: WWNAConstants.booleanOptions,
        defaultValue: "true"
    },
    isFullWidthButton: {
        label: "Is Full Width Button ?",
        type: "select",
        subType: "boolean",
        options: WWNAConstants.booleanOptions,
        defaultValue: "false"
    }
};

WWNAConstants.recommendationDialogConfig = {
    dialogVariant: {
        label: 'Dialog Variant',
        type: 'select',
        options: WWNAConstants.VARIANT_TYPE_LIST,
        defaultValue: "draggable"
    },
    headerInitialLabel: {
        label: "Header Initial Label",
        type: "input",
        defaultValue: ""
    },
    headerLoadingLabel: {
        label: "Header Loading Label",
        type: "input",
        defaultValue: ""
    },
    headerLoadedLabel: {
        label: "Header Loaded Label",
        type: "input",
        defaultValue: ""
    },
    footerLabel: {
        label: "Footer Label",
        type: "input",
        defaultValue: "Check AI-generated content for accuracy."
    },
    offsetLeft: {
        label: "Offset Left",
        type: "input",
        subType: "number",
        defaultValue: 10
    },
    offsetTop: {
        label: "Offset Top",
        type: "input",
        subType: "number",
        defaultValue: 10
    },
    height: {
        label: "Height",
        type: "input",
        subType: "number",
        defaultValue: 240
    },
    width: {
        label: "Width",
        type: "input",
        subType: "number",
        defaultValue: 540
    },
    insertButtonLabel: {
        label: "Insert Button Label",
        type: "input",
        defaultValue: "Insert"
    },
    refineCount: {
        label: "Refine Count",
        type: "input",
        defaultValue: "1"
    },
    hideInsertButton: {
        label: "Hide Insert Button ?",
        type: "select",
        subType: "boolean",
        options: WWNAConstants.booleanOptions,
        defaultValue: "false"
    },
    isDialogHoisted: {
        label: "Is Dialog Hoisted ?",
        type: "select",
        subType: "boolean",
        options: WWNAConstants.booleanOptions,
        defaultValue: "true"
    },
    additionalInfoTooltip: {
        label: "Additional Info Tool tip",
        type: "input",
        defaultValue: "AI generates text by using relevant context. Be sure to check for accuracy."
    }
};

WWNAConstants.choiceListForFeedback = {
    radio: {
        label: gs.getMessage('Radio'),
        type: 'radioList'
    },
    checklist: {
        label: gs.getMessage('Check List'),
        type: 'checkList'
    }
};

WWNAConstants.decoratorActionType = {
    create: 'create',
    remove: 'remove'
};


WWNAConstants.getXmlScript = (skillConfigId, tableName, columnName, componentId) => {
    return (`<?xml version="1.0" encoding="UTF-8"?>
<j:jelly xmlns:j="jelly:core" xmlns:g="glide" xmlns:g2="null" xmlns:j2="null" trim="true">
    <j2>
        <sn-wwna key="nacm-key-${columnName}" id="nacm-${columnName}"></sn-wwna>
        <script type="text/javascript">
            // addAfterPageLoadedEvent runs after the page is loaded, ready, and displayed for use
            addAfterPageLoadedEvent(function() {
                var nacmConfig = NOW.tableLevelNacmConfig;
                console.log(nacmConfig);
                if (nacmConfig?.active || "${skillConfigId}") {

                    WWNA.loadAssets();

                    var component = document.querySelector('#nacm-${columnName}');
                    component.wwnaComponentId = "${componentId}";
                    component.documentTableName = "$[JS:jvar_table]";
                    component.documentSysId = "$[JS:jvar_form_sys_id]";
					component.buttonProps = {};
					component.recommendationDialogProps = {};
					if(Object.keys(nacmConfig || {}).length){
						component.nacmConfig = nacmConfig;
					} else {
						component.skillConfigSysId = "${skillConfigId}";
					}
                    component.caller = "ui16";
                }
            });
        </script>
    </j2>
</j:jelly>`);
};

WWNAConstants.getQuickActionScript = (capabilityID, skillConfigId = '') => {
    capabilityID = capabilityID ? capabilityID : "<sys_id of sys_one_extend_capability>";
    skillConfigId = skillConfigId ? skillConfigId : '';

    return (`// Convert the payload in string to escape quotes.


	var stringifiedPayload = JSON.stringify(params[0]);

	// Escape the characters & < > from the string
	var escapedPayload = global.JSUtil.escapeText(stringifiedPayload);

	// unescape HTML if escaped already
	var unEscapedPayload = GlideStringUtil.unEscapeHTML(escapedPayload);

	// parse the strigified Payload
	var param = JSON.parse(unEscapedPayload);

	var jsonPayload = JSON.parse(param);
	var ambChannelName = jsonPayload.ambChannel;
	var CAPABILITY_ID = '${capabilityID}';
	var CAPABILITY_SKILL_CONFIG_ID = '${skillConfigId}';
	try {
		var utils = new global.WWNAGlobalUtils();
		var PAYLOAD = Object.assign({}, utils.createPayload(jsonPayload.payload, false));
		var skillInputVariables = utils.getSkillInputVariables(CAPABILITY_ID, PAYLOAD);
		PAYLOAD = Object.assign(PAYLOAD, skillInputVariables);
		// Update or customize the Skill Input variables in the PAYLOAD object from this section.
		PAYLOAD.skill_config_id = CAPABILITY_SKILL_CONFIG_ID || PAYLOAD.skill_config_id;
		const hasAccessToSkill = utils.hasAccessToSkill(PAYLOAD.skill_config_id, CAPABILITY_ID, CAPABILITY_SKILL_CONFIG_ID);

		if(hasAccessToSkill){
			// PAYLOAD.skillConfiguration gives you the skill config record
			// providing the promptConfigFilter will pick the right promptConfigID from sys_generative_ai_prompt_config
			var PROMPT_CONFIG_FILTERS = {
				"key": "value"
			};

			// Request payload for the capability
			var request = {
				"executionRequests": [{
					"payload": PAYLOAD,
					"meta": {
						"configFilters": PROMPT_CONFIG_FILTERS,
						"skillConfigId": PAYLOAD.skill_config_id,
						"source": PAYLOAD.trigger_source,
						"documentId": PAYLOAD.document_id,
						"documentTable": PAYLOAD.document_table
					},
					'returnRequest': true,
					"capabilityId": CAPABILITY_ID
				}],
				"mode": "async",
				"ambCallbackChannel": ambChannelName,
				"timeout":20
			};

			// Call to the OneExtend Capability
			var response  = sn_one_extend.OneExtendUtil.executeSecure(request);

			if (response.status === sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR) {
				gs.publish(ambChannelName, {
					"status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
					"errorMessage": utils.getErrorMessage(response)
				});
			}
		} else {
			gs.publish(ambChannelName, {
				"status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
				"errorMessage": sn_wwna.WWNAConstants.WWNA_ACL_FAILURE_MESSAGE
			});
		}
	} catch(err) {
		if (ambChannelName) {
			gs.publish(ambChannelName, {
				"status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
				"errorType": "error",
				"errorMessage": sn_wwna.WWNAConstants.GENERIC_ERROR_MESSAGE
			});
    	}
	}
	

	answer = {
		success: true,
		message: ""
	};`);
};

WWNAConstants.NACM_GUARDIAN_ERRORS = {
    ERROR_300200_300300: gs.getMessage("Now Assist detected content that may be harmful or offensive while processing this request. Your organization has chosen to block the output."),
    ERROR_300200: gs.getMessage("Now Assist detected language that some might find offensive while processing this request. Your organization has chosen to block the output."),
    ERROR_300300: gs.getMessage("Now Assist detected potentially harmful content while processing this request. Your organization has chosen to block the output."),
    ERROR_DEFAULT: gs.getMessage("Now Assist detected content that may be harmful or offensive while processing this request. Your organization has chosen to block the output."),
    ERROR_300001: gs.getMessage("Now Assist ran into an issue when checking this action for harmful content. It continued without completing this process. You may find harmful or offensive content in the output. Review it closely.")
};

WWNAConstants.NACM_GUARDIAN_ERROR_MAPPER = {
    300000: {
        conditions: [{
                check: (guardianErrorCodes) => guardianErrorCodes.includes(300200) && guardianErrorCodes.includes(300300),
                message: sn_wwna.WWNAConstants.NACM_GUARDIAN_ERRORS.ERROR_300200_300300
            },
            {
                check: (guardianErrorCodes) => guardianErrorCodes.includes(300200),
                message: sn_wwna.WWNAConstants.NACM_GUARDIAN_ERRORS.ERROR_300200
            },
            {
                check: (guardianErrorCodes) => guardianErrorCodes.includes(300300),
                message: sn_wwna.WWNAConstants.NACM_GUARDIAN_ERRORS.ERROR_300300
            }
        ],
        defaultMessage: sn_wwna.WWNAConstants.NACM_GUARDIAN_ERRORS.ERROR_DEFAULT
    },
    300001: {
        message: sn_wwna.WWNAConstants.NACM_GUARDIAN_ERRORS.ERROR_300001
    }
};

WWNAConstants.WWNA_TRIGGER_SOURCE_TO_ACTION_TYPE = {
    "WWNA: Menu": 'preset',
    "WWNA: Refine": 'refine',
    "WWNA: Default": 'preset',
};

WWNAConstants.INTENT_TYPE = {
    GENERAL_INQUIRY: 'GENERAL_INQUIRY',
    DATA_OPERATION: 'DATA_OPERATION',
    UI_ACTION: 'UI_ACTION'
};

WWNAConstants.ONE_EXTEND_SUB_STATES = {
    MULTI_ACTION: 'MULTI_ACTION',
    NEEDS_MORE_INFORMATION: 'NEEDS_MORE_INFORMATION',
    EMPTY_RESPONSE: 'EMPTY_RESPONSE'
};

WWNAConstants.WWNA_ACTION_TYPES = {
    REFINE: "refine",
    MENU: "preset",
    COMMON: "common",
    CALL_TO_ACTION: "callToAction",
    OPEN_PROMPT_ACTION: "openPromptAction",
};
