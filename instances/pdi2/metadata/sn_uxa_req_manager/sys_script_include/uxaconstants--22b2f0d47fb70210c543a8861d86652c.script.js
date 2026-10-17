var UXAConstants = Class.create();
UXAConstants.prototype = {
    initialize: function() {},
    type: 'UXAConstants'
};
UXAConstants.CACHE_KEY_FILTER_ATRBS = ['filterId', 'values', 'apply_to', 'sysId', 'start', 'end'];
UXAConstants.CACHE_KEY_DATA_ATRBS = ['dataCategory', 'type', 'metric', 'metricField', 'typeDivision', 'includeChange', 'includeChangePercentage', 'trendInterval', 'filterQuery', 'predicateComposition', 'applicationId', 'dataConfigType', 'trendBy', 'bucketType', 'events', 'aggregateBy', 'traceType', 'pageId', 'groupBy', 'orderBy', 'sortOrder', 'searchTerm', 'pageSize', 'pageNumber', 'columns'];
UXAConstants.EXPORT_LIMIT = gs.getProperty('sn_uxa_req_manager.export.max_rows', 10000);
UXAConstants.ISO86_DATE_INTERVAL_REGEX = '^P([0-9]+)([D,W,Y,M]$)';
UXAConstants.APPSEE = 'appsee';
UXAConstants.KEY = 'key';
UXAConstants.VALUE = 'value';
UXAConstants.TIMESTAMP = 'timestamp';
UXAConstants.CHANGE = 'change';
UXAConstants.CHANGE_PERCENT = 'changePercent';
UXAConstants.CLICK_HOUSE = 'click-house';
UXAConstants.DEFAULT_FIELD_TYPE = 'String';
UXAConstants.DEFAULT_GROUP_BY_ID = 'groupby';
UXAConstants.DEFAULT_GROUP_BY_LABEL = 'GroupBy';
UXAConstants.ALL = 'ALL';
UXAConstants.NEXT = 'next';
UXAConstants.PREV = 'prev';
UXAConstants.VISUALLY_TAGGED = 'visually_tagged';
UXAConstants.APPSEE_EVENT_TYPE = 'APPSEE_EVENT_TYPE';
UXAConstants.MINUS_AGGREGATION_KEYS = {
    FIELD_KEY: 'field',
    SUBTRACT_FROM_KEY: 'subtrahend',
    FIELD_FUNCTION_KEY: 'minuendFunction',
    SUBTRACT_FROM_FUNCTION_KEY: 'subtrahendFunction'
};
UXAConstants.DATA_CATEGORY = {
    SIMPLE: 'simple',
    GROUP: 'group',
    TREND: 'trend',
    DATATABLE: 'datatable',
    TIMESTAMP: 'timestamp',
    METADATA: 'metadata',
    FLAT: 'flat',
    FUNNEL: 'funnel',
    COHORT: 'cohort',
    ACTIVITY_TIMELINE: 'activity_timeline',
    NAVIGATION_PATHS: 'navigation-paths'
};
UXAConstants.METRIC = {
    TABLE: 'table',
    COUNT: 'count',
    SUM: 'sum',
    AVERAGE: 'average',
    EVENT_EXPORT: 'event_export',
    PAGE_NAV: {
        BAR_METRIC_NEXT_PAGE: 'next-page-views',
        BAR_METRIC_PREVIOUS_PAGE: 'previous-page-views'
    }
};
UXAConstants.METRIC_FIELD = {
    USERS: 'users',
    DURATION: 'duration',
    SESSIONS_PER_USER: 'sessions_per_user',
    RETENTION: {
        NEVER_RETURNED_COUNT: 'never-returned-count',
        RETURNED_AFTER_TIME_COUNT: 'returned-after-time-count',
        SESSION_FREQUENCY: 'session-frequency',
        AVG_TIME_BETWEEN_SESSIONS: 'avg-time-between-sessions'
    },
    TIME_ON_APP: 'time_on_app'
};

UXAConstants.PAR_METRIC_FIELD = {
    AVERAGE_PAGES_PER_SESSION: 'average_pages_per_session',
    AVERAGE_SESSIONS_PER_USER: 'average_sessions_per_user',
    AVERAGE_SESSION_DURATION: 'average_session_duration',
    GLIDE_DURATION: 'glide_duration',
    DECIMAL: 'decimal'
};

UXAConstants.CATEGORY = {
    NEW_USERS: 'New Users',
    ACTIVE_USERS: 'Active Users'
};

UXAConstants.METRIC_PAR_MAPPING = {
    simple: 'count',
    group: UXAConstants.DATA_CATEGORY.GROUP,
    trend: UXAConstants.DATA_CATEGORY.TREND,
    ['group-by-props']: 'event-props'
};
UXAConstants.DATA_CONFIG_TYPE = {
    SPARKLINE: 'sparkline'
};
UXAConstants.TREND_INTERVAL = {
    DAY: 'day',
    DAILY: 'daily',
    WEEK: 'week',
    WEEKLY: 'weekly',
    MONTH: 'month',
    MONTHLY: 'monthly'
};
UXAConstants.RELATIVE_DATE_PERIOD_MAPPING = {
    D: 'day',
    W: 'week',
    M: 'month',
    Y: 'year'
};
UXAConstants.TREND_MAPPING = {
    day: UXAConstants.TREND_INTERVAL.DAILY,
    week: UXAConstants.TREND_INTERVAL.WEEKLY,
    month: UXAConstants.TREND_INTERVAL.MONTHLY
};
UXAConstants.REQUEST_TYPE = {
    NEXT_GEN: 'next-gen',
    PAR: 'par',
};
UXAConstants.CHANGE_ARROW = {
    UP: 'up',
    DOWN: 'down',
    NEUTRAL: 'neutral',
    COLORS: {
        POSITIVE: "-now-datavis_color--positive",
        NEGATIVE: "--now-datavis_color--negative"
    }
};
UXAConstants.TYPE = {
    EVENTS: 'events',
    USERS: 'users',
    PAGES: 'pages',
    SESSIONS: 'sessions',
    PERFORMANCE: 'performance',
    APPLICATION: 'application',
    RETENTION: 'retention',
    'CROSSAPP-EVENTS': 'events',
    'SINGLEAPP-EVENTS': 'events'
};
UXAConstants.DSL_TYPE = {
    EVENTS: 'events',
    USERS: 'users',
    PAGES: 'pages',
    SESSIONS: 'sessions'
};
UXAConstants.DSL_AGGREGATION_FN = {
    COUNT: '$count',
    SUM: '$sum',
    AVERAGE: '$avg',
    UNIQUE: '$unique',
    MIN: '$min',
    MAX: '$max',
    START_OF_DAY: '$startOfDay',
    START_OF_WEEK: '$startOfWeek',
    START_OF_MONTH: '$startOfMonth',
    QUANTILES: '$quantiles',
    TO_GROUP_ARRAY: '$toGroupArray',
    MINUS: '$minus',
};
UXAConstants.DSL_OPERATORS = {
    EQUALS: '$eq',
    NOT_EQUALS: '$neq',
    GREATER_THAN: '$gt',
    GREATER_THAN_EQUALS: '$gte',
    LESS_THAN: '$lt',
    LESS_THAN_EQUALS: '$lte',
    NOT: '$not',
    IN: '$in',
    OR: '$or',
    STARTS_WITH: '$startsWith',
    LIKE: '$like',
    ILIKE: '$ilike',
    HAS_PROPERTY: '$hasProperty'
};
UXAConstants.COLUMN_TYPE_MAPPING = {
    'String': 'string',
    'LowCardinality(String)': 'string',
    'FixedString(32)': 'string',
    'UInt8': 'number',
    'UInt16': 'number',
    'UInt64': 'number',
    'Int16': 'number',
    'Float64': 'number',
    'Nullable(Float64)': 'number',
    'Number': 'number',
    'Bool': 'string',
    "DateTime('UTC')": 'string',
    'Date': 'date'
};
UXAConstants.USER_TYPE = {
    NEW: 'new',
    ACTIVE: 'active'
};
UXAConstants.DEFAULT_AGGREGATION_COLUMNS = {
    EVENTS: {
        COUNT: {
            NAME: 'Name',
            ALIAS: 'Occurrences',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.COUNT
        },
        ACTIVE_USERS: {
            NAME: 'InstanceUserId',
            ALIAS: 'Users',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        }
    },
    PAGES: {
        COUNT: {
            NAME: 'Name',
            ALIAS: 'Occurrences',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.COUNT
        },
        COUNT_SESSIONS: {
            NAME: 'LifecycleId',
            ALIAS: 'Sessions',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        },
        COUNT_USERS: {
            NAME: 'InstanceUserId',
            ALIAS: 'Users',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        },
        AVERAGE_DURATION: {
            NAME: 'Duration',
            ALIAS: 'AvgPageDuration',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.AVERAGE
        },
        SUM_DURATION: {
            NAME: 'Duration',
            ALIAS: 'SumPageDuration',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.SUM
        },
    },
    USERS: {
        COUNT: {
            NAME: 'InstanceUserId',
            ALIAS: 'Users',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        }
    },
    APPLICATION: {
        COUNT: {
            NAME: 'AppSysId',
            ALIAS: 'Occurrences',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.COUNT
        }
    },
    SESSIONS: {
        COUNT: {
            NAME: 'LifecycleId',
            ALIAS: 'Sessions',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        },
        DURATION_AVERAGE: {
            NAME: 'Duration',
            ALIAS: 'AvgSessionDuration',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.AVERAGE
        },
        AVERAGE_DURATION: {
            NAME: 'Duration',
            ALIAS: 'AvgSessionDuration',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.AVERAGE
        },
        AVERAGE_PAGES: {
            NAME: 'PagesCount',
            ALIAS: 'AvgPagesPerSession',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.AVERAGE
        },
        COUNT_USERS: {
            NAME: 'InstanceUserId',
            ALIAS: 'Users',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        }
    },
    PERFORMANCE: {
        COUNT: {
            NAME: 'PageId',
            ALIAS: 'TotalTraces',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.COUNT
        },
        AVERAGE_DURATION: {
            NAME: 'Duration',
            ALIAS: 'AvgSessionDuration',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.AVERAGE
        }
    }
};

UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS = {
    NAME: 'event_id',
    DISPLAY_NAME: 'display_name',
    DESCRIPTION: 'description',
    EVENT_TYPE: 'type',
    PROPERTIES: 'properties',
    APP_SYS_ID: 'application_id',
    TAGGED_EVENT_PROPERTIES: 'tagged_event_properties',
    SYS_ID: 'sys_id',
    FINGERPRINT: 'fingerprint',
    PAGE_ID: 'page_id',
};

UXAConstants.DATATABLE_COLUMNS = {
    EVENTS: {
        NAME: {
            COLUMN: 'Name'
        },
        OCCURRENCES: {
            COLUMN: 'Name',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.COUNT

        },
        ACTIVE_USERS: {
            COLUMN: 'InstanceUserId',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        },
        MAX_TIMESTAMP: {
            COLUMN: 'Timestamp',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.MAX
        },
        DISPLAY_NAME: {
            COLUMN: 'display_name',
            DB_COLUMN: 'false'
        },
        DESCRIPTION: {
            COLUMN: 'StringProperties.SN_Description',
        },
        EVENT_TYPE: {
            COLUMN: 'type',
            DB_COLUMN: 'false'
        },
        APPSEE_EVENT_TYPE: {
            COLUMN: 'StringProperties.event_type'
        },
        GROUPBY: ['NAME', 'DESCRIPTION', 'APPSEE_EVENT_TYPE'],
        ORDERBY: 'OCCURRENCES'
    },
    PAGES: {
        NAME: {
            COLUMN: 'Name'
        },
        VIEWS: {
            COLUMN: 'Name',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.COUNT
        },
        SESSIONS: {
            COLUMN: 'LifecycleId',
            ALIAS: 'SESSIONS',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        },
        PERCENT_OF_SESSIONS: {
            COLUMN: 'LifecycleId',
            ALIAS: 'SESSIONS',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        },
        AVERAGE_VIEW_TIME: {
            COLUMN: 'Duration',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.AVERAGE,
            'disableSorting': true,
        },
        ACTIVE_USERS: {
            COLUMN: 'InstanceUserId',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        },
        MAX_TIMESTAMP: {
            COLUMN: 'Timestamp',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.MAX
        },
        GROUPBY: ['NAME'],
        ORDERBY: 'VIEWS'
    },
    USERS: {
        USER_INDEX: {
            COLUMN: 'InstanceUserIdShort'
        },
        HASHED_USER_ID: {
            COLUMN: 'InstanceUserId',
        },
        ANONYMOUS_USER: {
            COLUMN: 'IsAnonymousUser',
        },
        SESSIONS: {
            COLUMN: 'LifecycleId',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        },
        FIRST_SESSION: {
            COLUMN: 'StartTime',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.MIN
        },
        LAST_SESSION: {
            COLUMN: 'StartTime',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.MAX
        },
        AVERAGE_SESSION_DURATION: {
            COLUMN: 'Duration',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.AVERAGE,
        },
        BROWSERS: {
            COLUMN: 'Browser',
            MOBILE_COLUMN: 'Device',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.TO_GROUP_ARRAY
        },
        LAST_LOCATION: {
            COLUMN: 'Location',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.TO_GROUP_ARRAY
        },
        GROUPBY: ['USER_INDEX', 'HASHED_USER_ID', 'ANONYMOUS_USER'],
        ORDERBY: 'SESSIONS'
    },
    SESSIONS: {
        SESSION_DATE: {
            COLUMN: 'StartTime',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.MIN
        },
        SESSION_DURATION: {
            COLUMN: {
                [UXAConstants.MINUS_AGGREGATION_KEYS.FIELD_KEY]: "EndTime",
                [UXAConstants.MINUS_AGGREGATION_KEYS.SUBTRACT_FROM_KEY]: "StartTime",
                [UXAConstants.MINUS_AGGREGATION_KEYS.FIELD_FUNCTION_KEY]: UXAConstants.DSL_AGGREGATION_FN.MAX,
                [UXAConstants.MINUS_AGGREGATION_KEYS.SUBTRACT_FROM_FUNCTION_KEY]: UXAConstants.DSL_AGGREGATION_FN.MIN
            },
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.MINUS,
        },
        USER_INDEX: {
            COLUMN: 'InstanceUserIdShort'
        },
        HASHED_USER_ID: {
            COLUMN: 'InstanceUserId',
        },
        BROWSER: {
            COLUMN: 'Browser',
            MOBILE_COLUMN: 'Device',
        },
        LAST_LOCATION: {
            COLUMN: 'Location'
        },
        NUMBER_OF_PAGES: {
            COLUMN: 'PagesCount',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.SUM,
        },
        NUMBER_OF_EVENTS: {
            COLUMN: 'EventsCount',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.SUM,
        },
        SESSION_ID: {
            COLUMN: 'LifecycleId'
        },
        SYSTEM_LOCALE: {
            COLUMN: 'SystemLocale',
        },
        BROWSER_TYPE: {
            COLUMN: 'BrowserType'
        },
        OS: {
            COLUMN: 'OSType',
        },
        APP_VERSION: {
            COLUMN: 'AppVersion',
        },
        OS_VERSION: {
            COLUMN: 'OSVersion',
        },
        BROWSER_VERSION: {
            COLUMN: 'BrowserVersion'
        },
        COUNTRY: {
            COLUMN: 'CountryCode'
        },
        REGION: {
            COLUMN: 'Region'
        },
        CITY: {
            COLUMN: 'City'
        },
        DEVICE_CODE: {
            COLUMN: 'DeviceCode'
        },
        ANONYMOUS_USER: {
            COLUMN: 'IsAnonymousUser',
        },
        GROUPBY: ['USER_INDEX', 'HASHED_USER_ID', 'BROWSER', 'LAST_LOCATION', 'SYSTEM_LOCALE', 'BROWSER_TYPE', 'OS', 'APP_VERSION', 'OS_VERSION', 'BROWSER_VERSION', 'COUNTRY', 'REGION', 'CITY', 'ANONYMOUS_USER', 'DEVICE_CODE', 'SESSION_ID'],
        ORDERBY: 'SESSION_DURATION'
    },
    APPLICATION: {
        NAME: {
            COLUMN: 'AppSysId'
        },
        CHANNEL: {
            COLUMN: 'Channel',
        },
        ACTIVE_USERS: {
            COLUMN: 'InstanceUserId',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        },
        SESSIONS: {
            COLUMN: 'LifecycleId',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
        },
        AVERAGE_SESSION_DURATION: {
            COLUMN: 'Duration',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.AVERAGE,
        },
        AVERAGE_SESSIONS_PER_USER: {
            COLUMNS: [{
                COLUMN: 'LifecycleId',
                ALIAS: 'SESSIONS',
                AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
            }, {
                COLUMN: 'InstanceUserId',
                ALIAS: 'ACTIVE_USERS',
                AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.UNIQUE
            }]
        },
        MAX_START_TIME: {
            COLUMN: 'StartTime',
            AGGREGATION: UXAConstants.DSL_AGGREGATION_FN.MAX
        },
        GROUPBY: ['NAME', 'CHANNEL'],
        ORDERBY: 'ACTIVE_USERS'
    },
    EVENT_EXPORT: {
        NAME: {
            COLUMN: 'Name'
        },
        CHANNEL: {
            COLUMN: 'Channel'
        },
        SESSION_ID: {
            COLUMN: 'LifecycleId',
        },
        HASHED_USER_ID: {
            COLUMN: 'InstanceUserId',
        },
        COUNTRY: {
            COLUMN: 'CountryCode',
        },
        EVENT_TIME: {
            COLUMN: 'Timestamp'
        }
    }
};
UXAConstants.COMPOSITE_ORDERBY = {
    SESSIONS: ['LAST_LOCATION']
};

//NOTE: Use this constant only for filtering and group case. 
UXAConstants.DATA_POINTS_COLUMNS = {
    COUNTRY: 'CountryCode',
    STATE: 'Region',
    APPLICATION: 'AppSysId',
    CHANNEL: 'Channel',
    NAME: 'Name',
    LOCALE: 'SystemLocale',
    TIMESTAMP: 'Timestamp',
    START_TIME: 'StartTime',
    DEVICE: 'DeviceCode',
    DEVICE_TYPE: 'DeviceType',
    VERSION: 'AppVersion',
    APP_VERSION: 'AppVersion',
    OS_VERSION: 'OSVersion',
    CONNECTIVITY: 'Connectivity',
    OPERATING_SYSTEM: 'OSType',
    DEVICE_RESOLUTION: 'DeviceResolution',
    BROWSER: 'BrowserType',
    SESSION_DURATION: 'Duration',
    HOURLY_USAGE: 'hourly_usage',
    USER_TYPE_STATE: 'UserState',
    STR_SYS_PROP_PAGE: 'StringProperties.SN_Page',
    STR_SYS_PROP_EVENT: 'StringSystemProperties.SN_Event',
    TRACE_TYPE: 'TraceType',
    PAGE_ID: 'PageId',
    USER_ID: 'InstanceUserId',
    SESSIONID: 'LifecycleId'
};
UXAConstants.DATA_POINTS_GROUPBY = {
    HOURLY_USAGE: [{
        GROUPBY: {
            '$toHour': 'StartTime',
            'alias': 'Hour'
        },
        ALIAS: 'Hour'
    }],
    SESSION_DURATION: [{
        GROUPBY: {
            '$toDurationBucket': 'Duration',
            'alias': 'DurationBucket'
        },
        ALIAS: 'DurationBucket'
    }]
};
UXAConstants.DURATION_GROUPBY_BUCKETS = {
    0: '0-3 Sec.',
    1: '3-10 Sec.',
    2: '10-30 Sec.',
    3: '30-60 Sec.',
    4: '1-3 Min.',
    5: '3-10 Min.',
    6: '10-30 Min.',
    7: '>30 Min.',
};
UXAConstants.RETENTION_AVG_TIME_SESSIONS_BUCKETS = {
    1: '1st and 2nd',
    2: '2nd and 3rd',
    3: '3rd and 4th',
    4: '4th and 5th',
    5: '5th and 6th',
    6: '6th and 7th',
    7: '7th and 8th'
};
UXAConstants.EVENTS_COLUMNS = {
    NAME: {
        'name': 'Name',
        'alias': 'Occurrences',
    }
};
UXAConstants.USERS_COLUMNS = {
    USER_ID: {
        'name': 'InstanceUserId',
        'alias': 'Users'
    }
};
UXAConstants.PAGES_COLUMNS = {
    NAME: {
        'name': 'Name',
        'alias': 'Occurrences'
    }
};
UXAConstants.SESSIONS_COLUMNS = {
    SESSIONS: {
        'name': 'LifecycleId',
        'alias': 'Sessions'
    }
};
UXAConstants.TREND_INTERVAL_TO_PROJECTION = {
    'daily': {
        'projection': '$startOfDay',
        'alias': 'Day'
    },
    'weekly': {
        'projection': '$startOfWeek',
        'alias': 'Week'
    },
    'monthly': {
        'projection': '$startOfMonth',
        'alias': 'Month'
    },
    'day': {
        'projection': '$startOfDay',
        'alias': 'Day'
    },
    'week': {
        'projection': '$startOfWeek',
        'alias': 'Week'
    },
    'month': {
        'projection': '$startOfMonth',
        'alias': 'Month'
    }
};
// Define constants for columns specific to SYS_UXA_SCREEN_DISPLAY_NAMES table
UXAConstants.UXA_SCREEN_DISPLAY_NAMES = {
    NAME: 'name',
    DISPLAY_NAME: 'display_name',
    APP_SYS_ID: 'app_sys_id'
};

UXAConstants.UXA_FILTER_TYPE = {
    CHOICE: 'choice',
    DATE: 'date',
    BOOLEAN: 'boolean'
};
UXAConstants.UXA_FILTER_ID = {
    COUNTRY: 'country',
    APPLICATION: 'application',
    CHANNEL: 'channel',
    USER_TYPE: 'user_type',
    LOCALE: 'locale',
    DATE_RANGE: 'date_range',
    PAGE: 'page',
    EVENT: 'event',
    EVENT_NAMES_BY_TYPE: 'event_names_by_type',
    PLATFORM: 'platform',
    OPERATING_SYSTEM: 'operating_system',
    VERSION: 'version', //OS Version
    BROWSER: 'browser',
    BROWSER_VERSION: 'browser_version',
    DEVICE_TYPE: 'device_type',
    SESSION_TYPE: 'session_type',
    DEVICE: 'device',
    EVENT_PROPERTY: 'event_property',
    CONNECTIVITY: 'connectivity',
    DEVICE_RESOLUTION: 'device_resolution',
    CITY: 'city',
    STATE: 'state',
    OS_TYPE: 'os_type',
    LANGUAGE: 'language',
    APP_VERSION: 'app_version',
    EVENT_PROPERTY_INDICATOR: 'event_property_indicator',
    EVENT_PROPERTY_VALUE: 'event_property_value',
    USER_DETAILS: 'user_details',
    CUSTOM_USER_PROPERTIES: 'custom_user_properties'
};
UXAConstants.TABLE = {
    FUNNEL: 'sys_uxa_funnel',
    COHORT: 'sys_uxa_cohort',
    ANALYTICS_APP: 'sys_analytics_app',
    ANALYTICS_CHANNEL: 'sys_analytics_channel',
    ANALYTICS_BUCKET: 'sys_analytics_bucket',
    UXA_APP_SCREEN: 'sys_uxa_screen_display_name',
    ANALYTICS_CUSTOM_USER_PROPERTIES: 'sys_analytics_user_property_config',
    USER: 'sys_user',
    EVENT_REPOSITORY: 'sys_uxa_event'
};
UXAConstants.RANK = 'rank';
UXAConstants.REQUIRED_COLUMNS = {
    'FUNNEL': ['sys_id', 'name', 'description', 'sys_created_by', 'sys_updated_on', 'steps', 'pinned', 'legacy_id', 'status'],
    'COHORT': ['sys_id', 'name', 'description', 'sys_created_by', 'sys_updated_on', 'steps', 'pinned', 'legacy_id',
        'status'
    ],
    'SINGLE_FUNNEL': ['sys_id', 'steps', 'name', 'sys_created_on', 'status'],
    'SINGLE_COHORT': ['sys_id', 'steps', 'name', 'sys_created_on', 'status']
};
UXAConstants.COHORT_ATTRIBUTES = {
    TYPE: 'type',
    DATE: 'date',
    USERS_COUNT: 'usersCount',
    PERCENT: 'percent',
    BUCKETS: 'buckets',
    IS_PARTIAL: 'isPartial'
};
UXAConstants.CHANNEL_ENUM = {
    MOBILE: {
        ID: 0,
        NAME: 'Mobile'
    },
    WEB: {
        ID: 1,
        NAME: 'Web'
    },
    CHAT: {
        ID: 2,
        NAME: 'Chat'
    },
    NOWEXPERIENCE: {
        ID: 4,
        NAME: 'NowExperience'
    },
    NEXTEXPERIENCE: {
        ID: 4,
        NAME: 'NextExperience'
    },
    COREUI: {
        ID: 5,
        NAME: 'CoreUI'
    }
};
UXAConstants.UI_COLUMN_MAPPING = {
    'app_sys_id': 'applicationId'
};
UXAConstants.VALID_STEP_NUMBERS = [0, 1, 3, 4];
UXAConstants.VALID_FIRST_FUNNEL_STEP = [3, 4];
UXAConstants.PAGE_VISIT_STEP_TYPE = 0;
UXAConstants.FUNNEL_ENUM_MAPPING = {
    0: 'pageView',
    1: 'eventTrigger',
    2: 'ScreenAction',
    3: 'sessionStartAny',
    4: 'sessionStart1st',
    5: 'SessionCrashed',
    6: 'ANR',
};
UXAConstants.FUNNEL_ENUM_UI_MAPPING = {
    0: 'ScreenView',
    1: 'EventTrigger',
    2: 'ScreenAction',
    3: 'Session Start (any)',
    4: 'Session Start (1st)',
    5: 'SessionCrashed',
    6: 'ANR',
};
UXAConstants.FUNNEL_DESCRIPTION_MAPPING = {
    0: 'Visited Page',
    1: 'Triggered Event',
    3: '',
    4: ''
};
UXAConstants.SESSION_ANY_ENUM_MAPPING = 3;
UXAConstants.SESSION_STARTED_MAPPING = 4;
UXAConstants.NAME = 'name';
UXAConstants.EVENT_TYPE = 'EVENT_TYPE';
UXAConstants.NAME_ALIAS = 'NAME';
UXAConstants.CHANNEL_ALIAS = 'CHANNEL';
UXAConstants.COUNTRY_ALIAS = 'COUNTRY';
UXAConstants.SESSION_DATE_ALIAS = 'SESSION_DATE';
UXAConstants.FIRST_SESSION_ALIAS = 'FIRST_SESSION';
UXAConstants.LAST_SESSION_ALIAS = 'LAST_SESSION';
UXAConstants.BROWSERS_TYPE_ALIAS = 'BROWSER_TYPE';
UXAConstants.BROWSERS_ALIAS = 'BROWSERS';
UXAConstants.USER_INDEX_ALIAS = 'USER_INDEX';
UXAConstants.SESSION_ID_ALIAS = 'SESSION_ID';
UXAConstants.HASHED_USER_ID_ALIAS = 'HASHED_USER_ID';
UXAConstants.ANONYMOUS_USER_ALIAS = 'ANONYMOUS_USER';
UXAConstants.APP_NAME_ALIAS = 'APPLICATION';
UXAConstants.APP_NAME_SESSION_ALIAS = 'AppSysId';
UXAConstants.ANONYMOUS = 'Anonymous';
UXAConstants.STATUS = 'status';
UXAConstants.ACTIVE = 'active';
UXAConstants.PINNED = 'pinned';
UXAConstants.APPLICATION_ID = 'app_sys_id';
UXAConstants.APP_ID = 'application_id';
UXAConstants.PAGE_ID = 'page_id';
UXAConstants.EVENT_ID = 'event_id';
UXAConstants.EVENT_NAME = 'NAME';
UXAConstants.DISPLAY_NAME = 'DISPLAY_NAME';
UXAConstants.TAGGED_EVENTS = 'tagged-events';
UXAConstants.HASHED_USER_ID = 'hashed_user_id';
UXAConstants.USER_HAS_ROLE_TABLE_NAME = 'sys_user_has_role';
UXAConstants.GROUP_MEMBER_TABLE_NAME = 'sys_user_grmember';
UXAConstants.APPLICATION_NAME = 'application_name';
UXAConstants.DESCRIPTION = 'description';
UXAConstants.PAGE_PERF_DEFAULT_GROUPS = ['Browser Time', 'Server Time', 'Page Load Time', 'Network Time'];
UXAConstants.OTHERS = 'Others';
UXAConstants.SORT_ORDER_ASC = 'asc';
UXAConstants.SORT_ORDER_DESC = 'desc';
UXAConstants.CONTAINS = 'CONTAINS';
UXAConstants.SYS_ID = 'sys_id';
UXAConstants.BUCKET_DOCUMENT_ID = 'bucket_document_id';
UXAConstants.ANALYTICS_CHANNEL = 'analytics_channel';
UXAConstants.UXA_GROUP_LIMIT = 10;
UXAConstants.UXA_HOURLY_USAGE_GROUP_LIMIT = 24;
UXAConstants.UXA_HOURLY_USAGE_ALIAS = 'Hour';
UXAConstants.UXA_SESSION_DURATION_ALIAS = 'DurationBucket';
UXAConstants.RETENTION_AVG_TIME_GROUPBY_ALIAS = 'session_range';
UXAConstants.UXA_DATATABLE_LIMIT = 20;
UXAConstants.NO_RESULTS = 'no_results';
UXAConstants.BROWSER_ALIAS = 'BROWSER';
UXAConstants.LAST_LOCATION = 'LAST_LOCATION';
//Add the datatable column of type string here to enable the case insensitive sorting.  
UXAConstants.DATATABLE_ORDER_BY_STRING_TYPE_COLUMNS = {
    EVENTS: ['NAME'],
    SESSIONS: [],
    PAGES: ['NAME'],
    USERS: [],
    APPLICATION: ['NAME']
};
UXAConstants.DURATION = 'Duration';
UXAConstants.AVERAGE_VIEW_TIME = 'AVERAGE_VIEW_TIME';
UXAConstants.PAGE_PERF_NAVIGATION_DEFAULT_GROUPS = ['direct load', 'navigation', ''];
UXAConstants.USERS_COUNT = 'UsersCount';
UXAConstants.AVERAGE_DURATION_STEP = 'AverageDurationStep';
UXAConstants.SCREEN_WIDTH = 'ScreenWidth';
UXAConstants.SCREEN_HEIGHT = 'ScreenHeight';
UXAConstants.QUERY_BUILDER_CONFIGURATION_PERMISSION = {
    ME: 0,
    EVERYONE: 1
};
UXAConstants.QB_UPDATE_STATUS = {
    DUPLICATE_NAME: 'DUPLICATE_NAME',
    USER_LIMIT_REACHED: 'USER_LIMIT_REACHED',
    SERVER_LIMIT_REACHED: 'SERVER_LIMIT_REACHED',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
};
UXAConstants.UNIQUE_SESSIONS = 'SESSIONS';
UXAConstants.UNIQUE_USERS = 'ACTIVE_USERS';
UXAConstants.ALIAS = 'alias';
UXAConstants.CUSTOM_USER_PROPERTY_PREFIXES = ['StringUserProperties', 'BooleanUserProperties'];
UXAConstants.EXCLUDED_FILTERS_FOR_RESOLUION_API = ['channel', 'app_version', 'paltform', 'session_type', 'device', 'user_type', 'date_range', 'connectivity', 'application', 'version'];
UXAConstants.UXA_FILTER_TABLE = 'sys_uxa_filters';
UXAConstants.SINGLE_SELCT_FILTER_TYPE = 0;
UXAConstants.MULTI_SELECT_FILTER_TYPE = 1;
UXAConstants.DATE_FILTER_TYPE = 2;
UXAConstants.BOOLEAN_FILTER_TYPE = 3;
UXAConstants.CHOICE_FILTER_TYPE = 'choice';
UXAConstants.REFERENCE_FILTER_TYPE = 'reference';
UXAConstants.FILTER_SELECTED_KEY = 'UXAFilterId';
UXAConstants.DA_MODE_TARGET = 'target';
UXAConstants.DA_DATA_SOURCE_LABEL = 'UX Analytics';
UXAConstants.DA_DATA_SOURCE_PLACE_HOLDER = 'Select a Property';
UXAConstants.DA_DATA_SOURCE_TYPE_SELECTOR = 'selector';
UXAConstants.FILTER_ID_DSL_MAP = {
    browser: 'BrowserType',
    app_version: 'AppVersion',
    device_type: 'DeviceType',
    country: 'CountryCode',
    locale: 'SystemLocale',
    device: 'DeviceCode',
    connectivity: 'Connectivity',
    version: 'OSVersion',
    operating_system: 'OSVersion',
    events: {
        browser: 'SystemPropertiesNumber[\'BrowserType\']'
    },
    pages: {
        browser: 'SystemPropertiesNumber[\'BrowserType\']'
    },
    funnel: {
        browser: 'SystemPropertiesNumber[\'BrowserType\']'
    },
};
UXAConstants.EXCLUDED_FILTERS_FOR_WEB = ["app_version", "connectivity"];
UXAConstants.EXCLUDED_FILTERS_FOR_MOBILE = ["browser"];
UXAConstants.DATA_TYPES = {
    STRING: 'string'
};
UXAConstants.DOT_REPLACE_STRING = '__UXADOT__';
UXAConstants.REFERENCE = 'reference';
UXAConstants.TABLE_EVENT_PROPERTY_NAME = {
    SN_PAGE: 'StringProperties.SN_Page',
    TABLE: 'StringProperties.table'
};
UXAConstants.TABLE_COLUMN_PROPERTY_NAME_MAP = {
    'StringProperties.SN_Page': "DataPointPropertiesString['SN_Page']",
    'StringProperties.table': "DataPointPropertiesString['table']"
};
UXAConstants.RESPONSE_TRANSFORMER_COLUMN_KEY_MAP = {
    START_TIME: 'TIMESTAMP',
    DataPointPropertiesString__SN_Page: 'StringProperties.SN_Page',
    DataPointPropertiesString__TABLE: 'StringProperties.table',
    AppSysId: "NAME",
    StringProperties__SN_Page: 'StringProperties.SN_Page',
    StringProperties__table: 'StringProperties.table',
    Name: "NAME",
    MAX_START_TIME: 'TIMESTAMP',
    MAX_TIMESTAMP: 'TIMESTAMP'
};
UXAConstants.UXA_DATA_CONTROLLER_SOURCE = 'UXA_DATA_CONTROLLER';
UXAConstants.TABLE_EVENTS = {
    [UXAConstants.TABLE_EVENT_PROPERTY_NAME.SN_PAGE]: ['Page Navigate'],
    [UXAConstants.TABLE_EVENT_PROPERTY_NAME.TABLE]: ['Click Form Action', 'Click List Action', 'Click List Link', 'Apply List Action', 'Select Additional Action']
};
