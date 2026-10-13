var PostIncidentReportConstantsSNC = Class.create();
PostIncidentReportConstantsSNC.prototype = {
    initialize: function() {
        this.EVENT_SOURCE = {
            INCIDENT: "INCIDENT",
            INCIDENT_TASK: "INCIDENT_TASK"
        };
        this.INCIDENT = {
            TABLE: "incident",
            CREATED_BY: "sys_created_on",
            RESOLVED_AT: 'resolved_at',
            RESOLVED_BY: 'resolved_by',
            PROMOTED_AT: 'promoted_on',
            PROMOTED_BY: 'promoted_by',
            PROPOSED_AT: 'proposed_on',
            PROPOSED_BY: 'proposed_by',
            ASSIGNED_TO: "assigned_to",
            SHORT_DESCRIPTION: "short_description",
            DESCRIPTION: "description",
            BUSINESS_IMPACT: "business_impact",
            CLOSE_NOTED: "close_notes",
            INCIDENT_CREATED: {
                _KEY: "INCIDENT_CREATED"
            },
            INCIDENT_PROPOSED_AS_MAJOR_INCIDENT: {
                _KEY: "INCIDENT_PROPOSED_AS_MAJOR_INCIDENT"
            },
            INCIDENT_ACCEPTED_AS_MAJOR_INCIDENT: {
                _KEY: "INCIDENT_ACCEPTED_AS_MAJOR_INCIDENT"
            },
            INCIDENT_RESOLVED: {
                _KEY: "INCIDENT_RESOLVED"
            },
            INCIDENT_CLOSED: {
                _KEY: "INCIDENT_CLOSED"
            }
        };
        this.POST_INCIDENT_REVIEW = {
            TABLE: "sn_sow_inc_post_incident_review",
            INCIDENT: "incident_ref",
            TIMELINE_SETTINGS: "timeline_settings",
            TIMELINE_EVENTS: "timeline_events",
            STATE: {
                _KEY: "state",
                _VALUE: {
                    DRAFT: "draft",
                    PUBLISHED: "published"
                }
            }
        };
        this.INCIDENT_TASK = {
            TABLE: "incident_task",
            INCIDENT: "incident",
            INCIDENT_TASK_CREATED: {
                _KEY: "INCIDENT_TASK_CREATED"
            },
            INCIDENT_TASK_CLOSED: {
                _KEY: "INCIDENT_TASK_CLOSED"
            }
        };

        this.ACTION_TYPE = {
            UPDATE_TIMELINE_SETTINGS: "UPDATE_TIMELINE_SETTINGS",
            UPDATE_TIMELINE_EVENTS: "UPDATE_TIMELINE_EVENTS",
            CREATE_TIMELINE_EVENT: "CREATE_TIMELINE_EVENT"
        };

        this.CUSTOM_EVENT = "CUSTOM_EVENT";

        //common table fields
        this.SYS_ID = 'sys_id';
        this.OPENED_AT = 'opened_at';
        this.OPENED_BY = 'opened_by';
        this.CLOSED_AT = 'closed_at';
        this.CLOSED_BY = 'closed_by';
        this.STATE = "state";
        this.DEFAULT_SETTINGS = {
            "eventGrouping": {
                "enabled": true,
                "eventGroupingInHours": 0,
                "eventGroupingInMinutes": 5,
                "eventGroupingInSeconds": 300
            },
            "orderOfEvents": "asc",
            "showHiddenEventsInEditView": true,
            "showManuallyAddedEvents": true,
            "showTimelineInFinalReport": true
        };

        this.GENERATED_BY = {
            SYSTEM: "SYSTEM",
            USER: "USER",
        };
        this.USER = {
            TABLE: "sys_user",
            USER_NAME: "user_name",
            TIME_FORMAT: "time_format",
            DATE_FORMAT: 'date_format',
            NAME: "name"
        };

        this.DISPLAY_TIME_CONSTANT = 72;

        this.INCIDENT_SUMMARY_STYLES = {
            header: "color: var(--now-color_text--primary);display: block;margin-bottom:8px;font-family:Lato;font-size:16px;font-weight:600;line-height:19px;letter-spacing:0px;text-align:left",
            shortDescription: "color: var(--now-color_text--primary);display: block;margin-bottom:8px;font-family:Lato;font-size:16px;font-weight:600;line-height:19px;letter-spacing:0px;text-align:left;word-break:break-all;",
            plainText: "color: var(--now-color_text--primary);display: block;margin-bottom:24px;font-family:Source Sans Pro;font-size:16px;font-weight:400;line-height:20px;letter-spacing:0px;text-align:left;word-break:break-all;",
            lastSectionText: "color: var(--now-color_text--primary);display: block;font-family:Source Sans Pro;font-size:16px;font-weight:400;line-height:20px;letter-spacing:0px;text-align:left;word-break:break-all;"
        };

        this.SYS_DATE_TIME_FORMAT = "NULL_OVERRIDE";

        this.ADMIN_CONFIG = {
            TABLE: "sn_sow_cfg_stg",
            RECORD_KEY: "key",
            TIMELINE_SETTINGS: "timeline_settings"
        };

        this.SYS_ACTIVITY_SUPPLEMENTAL = {
            TABLE: "sys_activity_supplemental",
            DOCUMENT_ID: "document_id",
            UPDATED_ON: "sys_updated_on",
            CREATED_BY: "sys_created_by",
            EVENT_ID: "event_id",
            PAYLOAD: "payload",
            ACTIVITY_FLAGGED: {
                _KEY: "ACTIVITY_FLAGGED"
            }
        };

        this.JOURNAL_FIELD = {
            TABLE: "sys_journal_field",
            ELEMENT: "element",
            MESSAGE: "value",
            CREATED_ON: "sys_created_on"
        };
    },

    type: 'PostIncidentReportConstantsSNC'
};
