var QueryServiceApiMetadata = {

    Params: {
        QUERY: {
            name: 'query',
            type: 'string'
        },

        APP_SYS_ID: {
            name: 'app_sys_id',
            type: 'string'
        },

        CHANNEL: {
            name: 'channel',
            type: 'string'
        },

        COUNTRY_CODE: {
            name: 'country_code',
            type: 'string'
        },

        REGION: {
            name: 'app_name',
            type: 'string'
        },

        OS: {
            name: 'os',
            type: 'string'
        },

        TARGET_COLOR: {
            name: 'target_color',
            type: 'string'
        },

        ACTION_TYPE: {
            name: 'action_type',
            type: 'string'
        },

        INVERT_COLOR: {
            name: 'invert_color',
            type: 'string'
        },

        SCREEN_NAME: {
            name: 'screen_name',
            type: 'string'
        },

        EVENT_NAME: {
            name: 'event_name',
            type: 'string'
        },

        COUNTRY: {
            name: 'country',
            type: 'string'
        },

        REGIONS: {
            name: 'regions',
            type: 'string'
        },

        SCREEN_TYPE: {
            name: 'screen_type',
            type: 'string'
        },

        APP_CHANNEL_TYPES: {
            name: 'app_channel_type',
            'type': 'string',
            valid_values: [{
                'k': 0,
                'v': 'Mobile'
            }, {
                'k': 1,
                'v': 'Web'
            }, {
                'k': 2,
                'v': 'Chat'
            }, {
                'k': 4,
                'v': 'NowExperience'
            }, {
                'k': 5,
                'v': 'CoreUI'
            }]
        },

        CONNECTIVITIES: {
            name: 'connectivities',
            type: 'string',
            valid_values: [{
                'k': 0,
                'v': 'None'
            }, {
                'k': 1,
                'v': 'WiFi'
            }, {
                'k': 2,
                'v': 'Cellular'
            }, {
                'k': 3,
                'v': 'Unknown'
            }]
        },

        DEVICE_TYPES: {
            name: 'device_types',
            type: 'string',
            valid_values: [{
                'k': 0,
                'v': 'Phone'
            }, {
                'k': 1,
                'v': 'Tablet'
            }, {
                'k': 2,
                'v': 'Desktop'
            }]
        },

        BROWSER_TYPES: {
            name: 'browser_types',
            type: 'string',
            valid_values: [{
                'k': 0,
                'v': 'Chrome'
            }, {
                'k': 1,
                'v': 'Firefox'
            }, {
                'k': 2,
                'v': 'Safari'
            }, {
                'k': 3,
                'v': 'Opera'
            }, {
                'k': 4,
                'v': 'Edge'
            }, {
                'k': 5,
                'v': 'IE'
            }, {
                'k': 6,
                'v': 'UC'
            }, {
                'k': 7,
                'v': 'Samsung'
            }, {
                'k': -1,
                'v': 'Other'
            }]
        },

        OS_TYPES: {
            name: 'os_types',
            type: 'string',
            valid_values: [{
                'k': 0,
                'v': 'iOS'
            }, {
                'k': 1,
                'v': 'Android'
            }, {
                'k': 2,
                'v': 'Windows'
            }, {
                'k': 3,
                'v': 'macOS'
            }, {
                'k': 4,
                'v': 'Linux'
            }, {
                'k': -1,
                'v': 'Other'
            }]
        },

        USER_TYPES: {
            name: 'user_types',
            type: 'string',
            valid_values: [{
                'k': 'new',
                'v': 'New'
            }, {
                'k': 'returning',
                'v': 'Returning'
            }]
        },

        EVENT_TYPE: {
            name: 'event_type',
            type: 'string'
        },

        START_DATE: {
            name: 'start_date',
            type: 'string'
        },

        END_DATE: {
            name: 'end_date',
            type: 'string'
        },

        EventPropertyType: {
            name: 'event_property_type',
            type: 'string'
        },

        FUNNEL: {
            name: 'steps',
            type: 'JSON'
        },

        SESSION_ID: {
            name: 'session_id',
            type: 'string'
        },

        INSTANCE_USER_ID: {
            name: 'instance_user_id',
            type: 'string'
        },

        EventPropertyName: {
            name: 'event_property_name',
            type: 'string'
        },

        STEPS: {
            name: 'steps',
            type: 'JSON'
        },
        
        BUCKET_TYPE: {
            name: 'bucket_type',
            type: 'string'
        },

        QUERY_FILTER: {
            name: 'query_filter',
            type: 'string'
        },

        FIRST_SESSIONS_RANGE: {
            name: 'first_sessions_range',
            type: 'string'
        },

        SAMPLING_LEVEL: {
            name: 'sampling_level',
            type: 'string'
        },

        SORT_DIRECTION: {
            name: 'sort_direction',
            type: 'string'
        },

        CONTAINS: {
            name: 'contains',
            type: 'string'
        },

        LIMIT: {
            name: 'limit',
            type: 'integer'
        },

        TIMEZONE: {
            name: 'timezone',
            type: 'string'
        },

        PAGE_NAME: {
            name: 'page_name',
            type: 'string'
        },

        PAGE_NAMES: {
            name: 'page_names',
            type: 'string'
        },

        TOP_PAGES_THRESHOLD: {
            name: 'top_pages_threshold',
            type: 'integer'
        },

        NAVIGATION_DIRECTION: {
            name: 'direction',
            type: 'string'
        },

        SORT_BY_NAME: {
            name: 'sort_by_name',
            type: 'string'
        }
    },

    type: 'QueryServiceApiMetadata'
};
