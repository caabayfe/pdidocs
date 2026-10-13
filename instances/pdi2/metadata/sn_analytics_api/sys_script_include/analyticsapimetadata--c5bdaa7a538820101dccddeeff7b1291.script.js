var AnalyticsAPIMetadata = {

    Params: {
        FROM_DATE: {
            name: 'from_date',
            type: 'date',
            format: 'yyyy-MM-dd'
        },

        TO_DATE: {
            name: 'to_date',
            type: 'date',
            format: 'yyyy-MM-dd'
        },

        API_KEY: {
            name: 'api_key',
            type: 'string',
        },

        PLATFORM: {
            name: 'platform',
            type: 'string',
        },

        ALLOW_STATISTICAL: {
            name: 'allow_statistical',
            type: 'boolean',
        },

        APP_VERSION: {
            name: 'app_version',
            type: 'string',
        },

        DATE_BUCKET: {
            name: 'date_bucket',
            type: 'string',
            valid_values: ['day', 'week', 'month'],
        },

        PROPERTY_CLASSIFIER: {
            name: 'property_classifier',
            type: 'string',
        },

        PROPERTY_NAME: {
            name: 'property_name',
            type: 'string',
        },

        DYNAMIC_PROPERTY_NAME: {
            name: 'dynamic_property_name',
            type: 'string',
        },

        PROPERTY_NAME_FILTER: {
            name: 'property_name_filter',
            type: 'string',
        },

        PROPERTY_VALUE_FILTER: {
            name: 'property_value_filter',
            type: 'string',
        },

        EVENT_TYPE: {
            name: 'event_type',
            type: 'string',
        },

        EVENT_TYPE_FILTER: {
            name: 'event_type_filter',
            type: 'string',
        },

        EVENT_NAME: {
            name: 'event_name',
            type: 'string',
        },

        EVENT_NAME_FILTER: {
            name: 'event_name_filter',
            type: 'string',
        },

        EVENT_PROPERTY_NAME: {
            name: 'event_property_name',
            type: 'string',
        },

        QUERY: {
            name: 'query',
            type: 'json',
        },

        PAGE_SIZE: {
            name: 'page_size',
            type: 'number',
        },

        PAGE_NUM: {
            name: 'page_num',
            type: 'number',
        },

        SORT_FIELD: {
            name: 'sort_field',
            type: 'string',
        },

        SORT_DIRECTION: {
            name: 'sort_direction',
            type: 'number',
            valid_values: [0, 1, 2],
        },

        USER_ID: {
            name: 'user_id',
            type: 'string',
        },

        INCLUDE_DELETED: {
            name: 'include_deleted',
            type: 'boolean'
        },

        SESSION_ID: {
            name: 'session_id',
            type: 'string'
        },

        IS_FAVORITE: {
            name: 'is_favorite',
            type: 'boolean'
        },

        COUNTRY: {
            name: 'country',
            type: 'string'
        },

        REGIONS: {
            name: 'regions',
            type: 'string'
        },

        FUNNEL_ID: {
            name: 'funnel_id',
            type: 'string'
        },

        OPTIONS: {
            name: 'options',
            type: 'json'
        },

        BATCH_ID: {
            name: 'batch_id',
            type: 'string'
        },
        SCREEN_TYPE: {
            name: 'screen_type',
            type: 'string'
        },

        FUNNEL_NAME: {
            name: 'funnel_name',
            type: 'string'
        },

        STEPS: {
            name: 'steps',
            type: 'array'
        },

        DATE_INTERVAL: {
            name: 'date_interval',
            type: 'number',
            valid_values: [0, 1, 2, 3],
        }
    }

};
