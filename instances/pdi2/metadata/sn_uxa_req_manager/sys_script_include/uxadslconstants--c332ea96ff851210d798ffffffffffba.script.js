var UXADSLConstants = Class.create();
UXADSLConstants.prototype = {
    initialize: function() {},
    properties: [{
            name: "Events", 
            id: "SessionCustomEvents",
            nestedRelation: "cascade",
            dslType: "cascade",
            nestedKeyName: "Properties",
            cascade: [{
                name: "Events",
                id: "Name",
                description: "Events",
                pluralDescription: "Events",
                values: [],
                returnDataType: "string",
                type: "list",
                contentType: "list",
                customActionButton: false,
                customActionButtonId: "filterProperties",
                customActionButtonLabel: "Filter Properties",
            }, ],
            nested: [],
        },
        {
            name: "screens",
            id: "SessionScreens",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            cascade: [{
                    name: "Platform",
                    id: "ScreenPlatformMobile",
                    dslPropertyName: "Platform",
                    description: "Platform",
                    type: "sessionplatform",
                    contentType: "list",
                    values: [],
                    returnDataType: "number",
                },
                {
                    id: "ScreenId",
                    name: "Screen",
                    type: "list",
                    values: [],
                    contentType: "list",
                    returnDataType: "string",
                },
            ],
        },
        {
            name: "screens",
            id: "SessionScreens1",
            dslPropertyName: "SessionScreens",
            showOnlyInContext: {
                platform: [2]
            },
            type: "list",
            values: [],
            contentType: "list",
            returnDataType: "string",
        },
        {
            name: "App Version",
            id: "SessionAppVersion",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            type: "bound",
            contentType: "list",
            values: [],
            returnDataType: "string",
        },
        {
            name: "Connectivity",
            id: "SessionConnectivity",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            type: "bound",
            contentType: "list",
            values: [],
            returnDataType: "string",
        },
        {
            name: "Country",
            id: "SessionCountryCode",
            dslPropertyName: "CountryCode",
            showOnlyInContext: {
                platform: [0, 1, "all", 2]
            },
            type: "bound",
            values: [],
            contentType: "list",
            returnDataType: "string",
        },
        {
            name: "Device",
            id: "SessionDeviceCode",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            type: "bound",
            contentType: "list",
            values: [],
            returnDataType: "string",
        },
        {
            name: "OS Version",
            id: "SessionOSVersion",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            type: "bound",
            values: [],
            contentType: "list",
            returnDataType: "string",
        },
        {
            name: "Bundle Id",
            id: "SessionBundleId",
            description: "Bundle Id",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            type: "string",
            contentType: "string",
            returnDataType: "string",
        },
        {
            name: "Device Type",
            id: "SessionDeviceType",
            showOnlyInContext: {
                platform: [0, 1, "all", 2]
            },
            type: "bound",
            values: [],
            contentType: "list",
            returnDataType: "string",
        },
        {
            name: "Duration",
            id: "SessionDuration",
            type: "duration",
            typeParams: {
                positiveNumber: true
            },
            values: [],
            contentType: "duration",
            returnDataType: "number",
        },
        {
            name: "Killed by User",
            id: "SessionPartial",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            type: "existencebasedboolean",
            contentType: "list",
            returnDataType: "boolean",
        },
        {
            name: `Index`,
            id: "SessionUserSessionIndex",
            type: "number",
            contentType: "number",
            values: [],
            returnDataType: "number",
        },
        {
            name: "Offline",
            id: "SessionIsOffline",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            type: "existencebasedboolean",
            contentType: "list",
            returnDataType: "boolean",
        },
        {
            name: "Locale",
            id: "SessionLocale",
            description: "Locale",
            type: "bound",
            showOnlyInContext: {
                platform: [2]
            },
            contentType: "list",
            values: [],
            returnDataType: "string",
        },
        {
            name: "Operating System",
            id: "SessionOSes",
            typeDescription: "List",
            showOnlyInContext: {
                platform: [2]
            },
            contentType: "list",
            cascade: [{
                    name: "OS Type",
                    id: "SessionOS",
                    type: "list",
                    contentType: "list",
                    values: [],
                    returnDataType: "string",
                    customizations: {
                        displayOperators: ["contain_any_of"],
                    },
                },
                {
                    name: "OS Version",
                    id: "SessionOSVersion1",
                    dslPropertyName: "SessionOSVersion",
                    type: "optionalbound",
                    contentType: "list",
                    conditionsCustomizations: {
                        namesMapping: {
                            any: "any version"
                        },
                    },
                    values: [],
                    returnDataType: "string",
                },
            ],
        },
        {
            name: "Browser",
            id: "SessionBrowsers",
            typeDescription: "List",
            showOnlyInContext: {
                platform: [2, "all"]
            },
            contentType: "list",
            cascade: [{
                    id: "SessionBrowserType",
                    name: "Browser Type",
                    type: "list",
                    contentType: "list",
                    values: [],
                    customizations: {
                        displayOperators: ["contain_any_of"],
                    },
                    returnDataType: "string",
                },
                {
                    id: "SessionBrowserVersion",
                    name: "Browser Version",
                    type: "optionalbound",
                    contentType: "list",
                    values: [],
                    customizations: {
                        operatorsNamesMapping: {
                            any: "any version"
                        },
                    },
                    returnDataType: "string",
                },
            ],
        },
        {
            name: "Platform",
            id: "SessionPlatformMobile",
            dslPropertyName: "SessionPlatform",
            description: "Platform",
            pluralDescription: "Platforms",
            type: "sessionplatform",
            contentType: "list",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            values: [],
            returnDataType: "string",
        },
        {
            name: "User Index",
            id: "UserAppIndex",
            type: "number",
            contentType: "number",
            returnDataType: "number",
        },
        {
            name: "Session Exists",
            id: "session",
            showOnlyInContext: {
                platform: [0, 1, 2, "all"]
            },
            returnDataType: "string",
            dslType: "nested",
            nested: [],
            manuallySortIndex: 2,
        },
        {
            id: "AppUserId",
            name: "Hashed User Id",
            type: "string",
            contentType: "string",
            returnDataType: "string",
            manuallySortIndex: 0,
        },
        {
            id: "UserAppIndex",
            name: "User Index",
            type: "number",
            contentType: "number",
            returnDataType: "number",
            manuallySortIndex: 1,
        },
        {
            id: "UserCountryCode",
            dslPropertyName: "CountryCode",
            name: "Country",
            showOnlyInContext: {
                platform: [0, 1, "all", 2]
            },
            type: "list",
            values: [],
            contentType: "list",
            returnDataType: "string",
        },
        {
            id: "UserDeviceCountUnique",
            name: "Device Count",
            type: "number",
            contentType: "number",
            typeParams: {
                positiveNumber: true
            },
            returnDataType: "number",
        },
        {
            id: "UserTotalSessions",
            name: `Count`,
            type: "number",
            contentType: "number",
            typeParams: {
                positiveNumber: true
            },
            showOnlyInContext: {
                platform: [2, 3]
            },
            returnDataType: "number",
        },
        {
            id: "UserTotalSessionsMobile",
            name: `Count`,
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            nestedPropName: "TotalSessions",
            cascade: [{
                    id: "UserPlatforms",
                    name: "Platform",
                    type: "userplatform",
                    contentType: "list",
                    returnDataType: "number",
                },
                {
                    id: "UserTotalSessions",
                    name: `Index`,
                    type: "number",
                    contentType: "number",
                    values: [],
                    returnDataType: "number",
                },
            ],
        },
        {
            id: "UserTotalDuration",
            name: "userTotalDuration",
            type: "duration",
            typeParams: {
                positiveNumber: true
            },
            showOnlyInContext: {
                platform: [2, 3]
            },
            contentType: "duration",
            returnDataType: "number",
        },
        {
            id: "UserTotalDurationMobile",
            name: "userTotalDuration",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            nestedPropName: "TotalDuration",
            cascade: [{
                    id: "UserPlatforms",
                    name: "Platform",
                    type: "userplatform",
                    contentType: "list",
                    returnDataType: "number",
                },
                {
                    id: "UserTotalDuration",
                    name: "userTotalDuration",
                    type: "duration",
                    contentType: "duration",
                    values: [],
                    returnDataType: "number",
                },
            ],
        },
        {
            id: "UserPlatforms1",
            dslPropertyName: "UserPlatforms",
            name: "Platform",
            type: "platform",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            contentType: "list",
            returnDataType: "number",
        },
        {
            id: "UserAppVersions",
            name: "App Version",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            nestedPropName: "AppVersions",
            cascade: [{
                    id: "UserPlatforms",
                    name: "Platform",
                    type: "userplatform",
                    contentType: "list",
                    returnDataType: "number",
                },
                {
                    id: "UserAppVersion",
                    name: "App Version",
                    type: "list",
                    contentType: "list",
                    values: [],
                    returnDataType: "string",
                },
            ],
        },
        {
            id: "UserDeviceCodes",
            name: "Device",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            type: "list",
            contentType: "list",
            values: [],
            returnDataType: "string",
        },
        {
            id: "UserDeviceTypes",
            name: "Device Type",
            showOnlyInContext: {
                platform: [0, 1, "all", 2]
            },
            type: "list",
            contentType: "list",
            values: [],
            returnDataType: "string",
        },
        {
            id: "UserOSVersions",
            name: "Operating System Version",
            showOnlyInContext: {
                platform: [0, 1, "all"]
            },
            nestedPropName: "OSVersions",
            cascade: [{
                    id: "UserPlatforms",
                    name: "Platform",
                    type: "userplatform",
                    contentType: "list",
                    returnDataType: "number",
                },
                {
                    id: "UserOSVersion",
                    name: "Operating System Version",
                    type: "list",
                    contentType: "list",
                    values: [],
                    returnDataType: "string",
                },
            ],
        },
        {
            name: "Operating System",
            id: "UserPlatformProperties.Web.OSes",
            showOnlyInContext: {
                platform: [2]
            },
            contentType: "list",
            cascade: [{
                    id: "OS",
                    name: "OS Type",
                    type: "list",
                    contentType: "list",
                    customizations: {
                        displayOperators: ["contain_any_of"],
                    },
                    returnDataType: "string",
                },
                {
                    name: "OS Version",
                    id: "Version1",
                    dslPropertyName: "Version",
                    type: "optionallist",
                    contentType: "list",
                    values: [],
                    customizations: {
                        operatorsNamesMapping: {
                            any: "any version"
                        },
                    },
                    returnDataType: "string",
                },
            ],
        },
        {
            name: "Browser",
            id: "UserPlatformProperties.Web.Browsers",
            showOnlyInContext: {
                platform: [2]
            },
            contentType: "list",
            cascade: [{
                    id: "Type",
                    name: "Type",
                    type: "list",
                    contentType: "list",
                    customizations: {
                        displayOperators: ["contain_any_of"],
                    },
                    returnDataType: "string",
                },
                {
                    id: "Version",
                    name: "Version",
                    type: "optionallist",
                    contentType: "list",
                    values: [],
                    customizations: {
                        operatorsNamesMapping: {
                            any: "any version"
                        },
                    },
                    returnDataType: "string",
                },
            ],
        },
        {
            name: "Locale",
            id: "Locales1",
            dslPropertyName: "UserPlatformProperties.Web.Locales",
            type: "list",
            showOnlyInContext: {
                platform: [2]
            },
            contentType: "list",
            values: [],
            returnDataType: "string",
        },
    ],
    operators: {
        string: [{
                id: "equals_to",
                label: "equals to",
                dsl: '{"eq":{0}}',
            },
            {
                id: "not_equals_to",
                label: "not equals to",
                dsl: '{"neq":{0}}',
            },
        ],
        number: [{
                id: "equal",
                label: "=",
                dsl: '{"eq":{0}}',
            },
            {
                id: "notequal",
                label: "!=",
                dsl: '{"neq":{0}}',
            },
            {
                id: "greater",
                label: ">",
                dsl: '{"gt":{0}}',
            },
            {
                id: "greater_equal",
                label: ">=",
                dsl: '{"gte":{0}}',
            },
            {
                id: "less",
                label: "<",
                dsl: '{"lt":{0}}',
            },
            {
                id: "less_equal",
                label: "<=",
                dsl: '{"lte":{0}}',
            },
            {
                id: "between",
                label: "is between",
                dsl: '{"gte":{0},"lte":{1}}',
            },
        ],
        duration: [{
                id: "greater",
                label: ">",
                dsl: '{"gt":{0}}',
            },
            {
                id: "greater_equal",
                label: ">=",
                dsl: '{"gte":{0}}',
            },
            {
                id: "less",
                label: "<",
                dsl: '{"lt":{0}}',
            },
            {
                id: "less_equal",
                label: "<=",
                dsl: '{"lte":{0}}',
            },
            {
                id: "between",
                label: "is between",
                dsl: '{"gte":{0},"lte":{1}}',
            },
        ],
        date: [{
                id: "is_on",
                label: "is on",
                dsl: '{"gte":{0},"lte":{1}}',
            },
            {
                id: "later_than",
                label: "is later than",
                dsl: '{"gt":{0}}',
            },
            {
                id: "earlier_than",
                label: "is earlier than",
                dsl: '{"lt":{0}}',
            },
            {
                id: "in_last",
                label: "is in the last",
                dsl: '{"in_last":{"value":{0},"timeUnit":"{1}"}}',
            },
        ],
        list: [{
                id: "contain_any_of",
                label: "contain any of",
                dsl: '{"contains_any":[{0}]}',
            },
            {
                id: "contain_all_of",
                label: "contain all of",
                dsl: '{"contains_all":[{0}]}',
            },
        ],
        optionallist: [{
                id: "any",
                label: "any",
                dsl: '{"contains_any":[]}',
            },
            {
                id: "contain_any_of",
                label: "contain any of",
                dsl: '{"contains_any":[{0}]}',
            },
            {
                id: "contain_all_of",
                label: "contain all of",
                dsl: '{"contains_all":[{0}]}',
            },
        ],
        bound: [{
                id: "is_any",
                label: "is any of",
                dsl: '{"is_any":[{0}]}',
            },
            {
                id: "is_not_any",
                label: "is none of",
                dsl: '{"is_not_any":[{0}]}',
            },
        ],
        optionalbound: [{
                id: "any",
                label: "any",
                dsl: "",
            },
            {
                id: "is_any",
                label: "is any of",
                dsl: '{"is_any":[{0}]}',
            },
            {
                id: "is_not_any",
                label: "is none of",
                dsl: '{"is_not_any":[{0}]}',
            },
        ],
        platform: [{
                id: "contain",
                label: "contain",
                dsl: '{"contains_all":[{0}]}',
            },
            {
                id: "contain_only",
                label: "contain only",
                dsl: '{"contain_only":{0}}',
            },
        ],
        sessionplatform: [{
            id: "is",
            label: "is",
            dsl: '{"eq":{0}}',
        }, ],
        userplatform: [{
            id: "in",
            label: "in",
            dsl: '{"eq":{0}}',
        }, ],
        existencebasedboolean: [{
            id: "is",
            label: "is",
            dsl: '{"{1}":{0}}',
        }, ],
        reference: [{
            id: "is_any",
            label: "is any of",
            dsl: '{"is_any":[{0}]}',
        }, ],
        boolean: [{
            id: "is",
            label: "is",
            dsl: '{"{1}":{0}}',
        }, ]
    },
    noValueOperators: ["any", "is_set", "is_not_set"],
    MILLISECONDS_IN_SECONDS: 1000,


    type: 'UXADSLConstants'
};
