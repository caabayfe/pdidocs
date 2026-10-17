var NowAdminAssistMetadata = Class.create();
NowAdminAssistMetadata.prototype = {
    initialize: function() {},

    PLUGINS_FAQS: [{
            id: 1,
            question: gs.getMessage("What are the specific product terms that apply to generative AI plugins?"),
            answer: gs.getMessage("All generative AI products are subject to the product-specific terms. These new and advanced products require ServiceNow to utilize the latest hardware and data processing techniques to ensure a secure, dependable, and scalable AI experience across all product lines. Customers of ServiceNow must agree to additional terms to utilize these advanced AI & data products. To continuously enhance the performance and development of these products and other ServiceNow products, ServiceNow allows customers to contribute data, which will be anonymized and cleansed. Data will be collected in the subscription service.")
        },
        {
            id: 2,
            question: gs.getMessage("How is ServiceNow improving generative AI plugins and products?"),
            answer: gs.getMessage("We include data from customers who do not opt-out so we can enhance the ServiceNow user experience, tailor products to your business needs, and improve their accuracy. Your input can help AI models learn from real-world scenarios, allowing for smarter and more contextually aware interactions.")
        }
    ],

    PLUGINS_HELPFUL_RESOURCES: [{
            "id": "1",
            "label": gs.getMessage("Now Assist Plugins: Overview"),
            "link": "/api/now/v1/context_doc_url/exploring-now-assist-platform",
            "configAria": {
                "aria-label": gs.getMessage("Now Assist Plugins: Overview"),
            },
        },
        {
            "id": "2",
            "label": gs.getMessage("Installing Now Assist Plugins"),
            "link": "/api/now/v1/context_doc_url/install-now-assist-feature-plugins",
            "configAria": {
                "aria-label": gs.getMessage("Installing Now Assist Plugins ")
            },
        },
        {
            "id": "3",
            "label": gs.getMessage("Now Assist AI ethics and policies"),
            "link": "https://www.servicenow.com/content/dam/servicenow-assets/public/en-us/doc-type/other-document/responsible-ai-guidelines.pdf",
            "configAria": {
                "aria-label": gs.getMessage("Now Assist AI ethics and policies")
            },
        }
    ],

    PANEL_HELPFUL_RESOURCES: [{
            "id": "1",
            "label": gs.getMessage("Set up Now Assist panel"),
            "link": "/api/now/v1/context_doc_url/activate-now-assist-panel",
            "aria_config": {
                "aria-label": gs.getMessage("Set up Now Assist panel")
            }
        },
        {
            "id": "2",
            "label": gs.getMessage("Community forum"),
            "link": "https://www.servicenow.com/community/",
            "aria_config": {
                "aria-label": gs.getMessage("Community forum")
            }
        }
    ],

    PANEL_FAQS: [{
        "question": gs.getMessage("How do I know who has permissions to access this?"),
        "answer": gs.getMessage("Users who are assigned the necessary role configuration and permissions will automatically get access once Now Assist panel is turned on. To learn more about roles and how they’re managed, check out our helpful resources.")
    }, {
        "question": gs.getMessage("Can I change the brand of the Now Assist panel?"),
        "answer": gs.getMessage("The Now Assist panel will uptake the theme applied to your Next Experience UI to ensure a consistent look and feel.")
    }, {
        "question": gs.getMessage("How is the panel different from Now Assist in other places?"),
        "answer": gs.getMessage("The Now Assist panel is conversational and globally accessible via the Next Experience Unified Navigation.")
    }],

    GET_STARTED_WORKFLOWS: ["0f3e04d7a320311079f66bcf26fcdacc", "676ec4d7a320311079f66bcf26fcda61", "f08e88d7a320311079f66bcf26fcda70"],

    USER_ANALYTICS_CARD_NAMES: {
        GET_STARTED_CARD: "styleable_container_7",
        NOW_ASSIST_SUMMARY_CARD: "now_assist_summary_data_viz_2",
        NOW_ASSIST_ANALYTICS_CARD: "styleable_container_58",
        TURN_ON_NOW_ASSIST_PANEL_CARD: "styleable_container_72",
        NOW_ASSIST_ADMIN_JOURNEY_CARD: "styleable_container_65",
        CONVERSATIONAL_EXPERIENCE_CARD: "styleable_container_71",
    },

    SKILL_STATES: {
        DRAFT: gs.getMessage("Draft"),
        ACTIVE: gs.getMessage("Active"),
        INACTIVE: gs.getMessage("Inactive"),
        NOT_STARTED: gs.getMessage("Not started")
    },

    SKILL_STATES_LABEL_COLOUR: {
        "draft": {
            'label': gs.getMessage("Draft"),
            "colour": 'warning'
        },
        "active": {
            'label': gs.getMessage("Active"),
            "colour": 'positive'
        },
        "inactive": {
            'label': gs.getMessage("Inactive"),
            "colour": 'orange'
        },
        "notconfigured": {
            'label': gs.getMessage("Not started"),
            "colour": 'low'
        }
    },

    PLUGINS_TOBE_VERIFIED: [],

    NON_NA_PLATFORM_PLUGINS: [],

    WWNA_CONFIG_TYPE_ID: '8c9697d7a38a421075d1d78446fcda50',
    WWNA_ADMIN_CONFIG_TYPE_ID: '30b5779c9352d2104d0a423b92891818',
    SKILL_CONFIG_DEFAULT_DEFINITION_CONFIG_TYPE: "d175c9117faa1210f465c3b76d8665c9",
    NACM_SKILL_CONFIG_TEMPLATE: '0e01aa8d932112104d0a423b928918ce',
    NACM_QUICK_ACTIONS: 'wwna_quick_actions',

    CREATOR_WORKFLOW_ID: '715ec4d7a320311079f66bcf26fcdadd',

    PLATFORM_WORKFLOW_ID: '00202261eb383110da1861c59c5228e4',

    NOW_ASSIST_GUARDIAN: {
        MONITOR: "MONITOR",
        BLOCK: "BLOCK",
        OFF: "OFF",
        OFFENSIVENESS_TYPE: "Offensiveness (Now Assist Skill)",
        PROMPT_INJECTION_TYPE: "Prompt Injection"
    },
    DELIVERY_VAR_SET_SYS_ID: "select-delivery",
    DEFAULT_VIEW_TRIGGER_VAR_SET_CONFIG_TYPE: "b89b1f0b7f821210076726d6ac86650e",
    DEFAULT_SKILL_BUILDER_DELIVERY_STEP_CONFIG_TYPE: "7dfdff5893b64210aa5730f164891837",
    PRODUCT_LIST_NOT_SUPPORTING_OFFENSIVENESS: [{
		label:'Knowledge',
		id:'3bb126d9fff432106f72ffffffffffce'
	}],
    type: 'NowAdminAssistMetadata'
};
