function include() {
    const CMDB_TABLE_NAMES = {
        CMDB_DATA_MANAGEMENT_TASK : "cmdb_data_management_task",
        CMDB_DM_POLICY_EXECUTION: "cmdb_data_management_policy_execution",
        CMDB_DM_POLICY: "cmdb_data_management_policy",
        CMDB_DM_CERTIFICATION_POLICY: "sn_cmdb_ws_dm_certification_policy",
        CMDB_DM_RUNTIME_ATTRIBUTES: "cmdb_data_management_policy_runtime_attributes",
        CMDB_RETIREMENT_CUSTOM_DEFINITIONS: "cmdb_retirement_custom_definitions",
        CMDB_DEDUPE_TASK: "reconcile_duplicate_task"
    };

    const DM_POLICY_TYPE_IDS = {
        NON_LIFECYCLE: {
            ATTESTATION: "7b80ed7753823010ee0dddeeff7b1223",
            CERTIFICATION: "fe2a16b3436031106d8a8ef0dab8f2ff"
        },
        LIFECYCLE: {
            ARCHIVE: "b82b20d00731201017b703767cd300e1",
            DELETE: "562bec900731201017b703767cd300e7",
            RETIRE: "66306fcb7352201026f6aa114df6a77c",
        },
        DEPENDENT: {
            ARCHIVE: "b081fd511b727010a21d20a8ec4bcba1",
            DELETE: "95eefab2533130108cabddeeff7b1218",
            RETIRE: "fb68f7d07301011026f6aa114df6a7e4"
        },
        DELETE_RELATED_ENTRY: "c3059c79ff920110456d766cf43bf1c6"
    }

    const BASE_AGG_POLICY_TYPE_GROUP_BY_VALUE_TO_ID = {
        'policy_type_attestation': '7b80ed7753823010ee0dddeeff7b1223',
        'policy_type_certification': 'fe2a16b3436031106d8a8ef0dab8f2ff',
        'policy_type_delete': '562bec900731201017b703767cd300e7',
        'policy_type_retire': '66306fcb7352201026f6aa114df6a77c',
        'policy_type_archive': 'b82b20d00731201017b703767cd300e1',
        'policy_type_dependent_ci_deletion': '95eefab2533130108cabddeeff7b1218',
        'policy_type_dependent_ci_retire': 'fb68f7d07301011026f6aa114df6a7e4',
        'policy_type_dependent_ci_archive': 'b081fd511b727010a21d20a8ec4bcba1'
    }

    const DM_POLICY_STATUS = {
        DRAFT: "Draft",
        INACTIVE: "Inactive",
        EVALUATION_FAILED: "Evaluation Failed",
        PUBLISHED: "Published"
    };

    const DM_TASK_STATE = {
         OPEN : "1",
         WORK_IN_PROGRESS : "2",
         CLOSED_COMPLETE : "3",
         CLOSED_INCOMPLETE: "4",
         CLOSED_SKIPPED: "7",
         CLOSED_CANCELLED: "8"
   };

    const DM_PAGE_TABS = {
        DM_OVERVIEW : "0",
        POLICIES: "1",
        SUBFLOWS: "2",
        EXCLUDED_CIS: "3",
        ANALYTICS: "4",
        SETTINGS: "5"
    };

    const DM_POLICIES_PAGE_SUBTABS = {
        PUBLISHED_POLICIES: "0",
        DRAFT_POLICIES: "1",
        DEACTIVATED_POLICIES: "2",
        POLICIES_FAILING_EVALUATION: "3"
    };

    const MAX_NUM_QUICK_LINKS = 10;

    const DATA_INGESTION_TAB_ID ="data_ingestion";

    const HEALTH_STATUS_BADGE_COLOR = {
        EXCELLENT : "positive",
        FAIR: "high",
        POOR: "critical"
    };

    const HEALTH_STATUS_BADGE_VARIANT = {
        SECONDARY: "secondary",
        TERTIARY: "tertiary"           
    };

    const LINK_TYPES = {
        ROUTE: 'route',
        EXTERNAL: 'external'
    };

    const PAGE_ROUTES = {
        RECORD: 'record',
        LIST : 'list',
        DM_HOME: 'data-manager',
        DM_POLICY_FORM : 'data-manager-policy-form',
        TASK_DETAILS : 'task-detail',
        REVIEW_CI : 'attestation-review-cis',
        DM_POLICY_DETAILS: 'data-manager-policy-details',
        DM_POLICY_EXECUTION_DETAILS: 'data-manager-policy-execution',
        RETIREMENT_DEFINITION: 'retirement-definition',
        MY_WORK: 'my-work',
        DE_DUPE_TASK_DETAILS:'remediate-duplicate-task'
    };

    const HREF_FOR_ROUTE_TYPE = 'javascript:void(0);'

    const TABLE_NAMES = {
        SYS_DATA_SOURCE : "sys_data_source",
        SCHEDULED_IMPORT_SET: "scheduled_import_set"
    };
  
    const DM_PROPERTY_NAMES = {
         PROP_NAME_AGING_POLICY_TASK_TIMEFRAME : "sn_cmdb_ws.glide.cmdb.data.manager.aging.policy.task.timeframe",
         PROP_NAME_SUBFLOW_TIMEOUT: "glide.cmdb.data.manager.subflow.timeout",
         PROP_NAME_ARCHIVAL_TIME_BEFORE_DELETE_IN_DAYS: "glide.cmdb.data_manager.default_archive_time",
         PROP_NAME_STALE_TASK_LIFE_IN_DAYS: "cmdb.data.manager.stale.task.life.in.days",
         PROP_NAME_REJECTED_TASK_NOTIFICATIONS_GROUP: "sn_cmdb_ws.glide.cmdb.data_manager.rejected.task.notifications.group",
         PROP_NAME_NOTIFICATION_SETTINGS: "sn_cmdb_ws.cmdb.dm.policy_types.due_date_notification",
         PROP_NAME_RUN_AS_USER_GROUP: "sn_cmdb_ws.glide.cmdb.data_manager.scheduled_job_user_group",
         PROP_NAME_DEFAULT_RUN_AS_USER: "sn_cmdb_ws.glide.cmdb.data_manager.scheduled_job_default_user"
    };
        
    const OPERATORS = {
        OR: "^OR",
        AND: "^",
        NEW_QUERY: '^NQ',
        END_QUERY: '^EQ'
    };

    const FIELD_TYPES = {
        REFERENCE: 'reference'
    };

    var _openMyWorkTaskRecordInNewTab = function (api, event) {
        var ROUTE = {
            "ATTESTATION_TASK": "attestation-task",
            "RECORD": "record"
        };
        var ATTESTATION_POLICY_TYPE_ID = '7b80ed7753823010ee0dddeeff7b1223';

        var route = ROUTE.RECORD;
        var title = event.payload.row.rowData.value.get('number').columnData.displayValue;
        var fields = {
            sysId: event.payload.sys_id,
            table: event.payload.table
        };

        var policyTypeId = event.payload.row.rowData.value.get('policy_id.cmdb_policy_type').columnData.value;
        if (event.payload.table == 'cmdb_data_management_task' && policyTypeId == ATTESTATION_POLICY_TYPE_ID) {
            route = ROUTE.ATTESTATION_TASK;
            fields = {
                sysId: event.payload.sys_id
            };
        }
        var customPayload = {
            "route": route,
            "targetRoute": "current",
            "fields": fields,
            "title": title
        };

        api.emit('NAV_ITEM_SELECTED', customPayload);
    }

    var _getFieldValueFromEncodedQuery = function (encodedQuery, field) {
         let value = "";
         let splitQuery = encodedQuery.split('^');
         let index = splitQuery.findIndex((x) => x.startsWith(field));
         if (index > -1) {
            value = splitQuery[index].split('=')[1];
          }
          return value;
    }

    var _handleLinkClick = function (helpers, value) {
        if (value.type === LINK_TYPES.EXTERNAL) {
            return;
        }

        if (value.type === LINK_TYPES.ROUTE) {
            helpers.navigate.to(
                value.route.route, 
                value.route.fields, 
                value.route.params || {}, 
                null, 
                null, 
                'current'
            );
        }
    }

    var _formatLastUpdInfoText = async function (helpers, lastUpdInfo) {
        const defLastUpdatedInfo = await helpers.translate("Last updated: N/A");

        if (lastUpdInfo) {
            return await helpers.translate("Last updated: {0}", lastUpdInfo);
        } else {
            return defLastUpdatedInfo;
        }
    }

    var _buildFieldMetadata = function (item) {
        let value;
        if (item.reference) {
            value = {
                "type": "text-link",
                "label": item.displayValue,
                "href": "javascript:void(0)",
                "value": item.value,
                "data": item.reference
            };
        } else if (item.hasNewLine) {
            value = {
                "type": "html",
                "value": "<div>" + item.displayValue.replaceAll("\n", "<br />")  + "</div>",
                "data": item
            };
        } else {
            value = {
                "type": "string",
                "value": item.displayValue,
                "data": item
            };
        }
        return {
            "label": item.label,
            "value": value
        };
    }

    const handleReferenceLinkClickEvent = function({event, helpers}) {
        const {
            table,
            sys_id: sysId
        } = event.payload;
        let route = 'record';
        let params = {};
        let fields = {}

        if (table == CMDB_TABLE_NAMES.CMDB_DM_POLICY || table == CMDB_TABLE_NAMES.CMDB_DM_RUNTIME_ATTRIBUTES || table == CMDB_TABLE_NAMES.CMDB_DM_CERTIFICATION_POLICY) {
            route = PAGE_ROUTES.DM_POLICY_DETAILS;
            fields = {
                policyRuntimeAttributesSysId: sysId
            };
            params = { ts: Date.now() };
        } else if (table == CMDB_TABLE_NAMES.CMDB_DM_POLICY_EXECUTION) {
            route = PAGE_ROUTES.DM_POLICY_EXECUTION_DETAILS;
            fields = {
                sysId
            };
            params = { ts: Date.now() };
        } else if (table == CMDB_TABLE_NAMES.CMDB_DATA_MANAGEMENT_TASK) {
            route = PAGE_ROUTES.TASK_DETAILS;
            fields = {
                sysId
            };
        } else if (table == CMDB_TABLE_NAMES.CMDB_RETIREMENT_CUSTOM_DEFINITIONS) {
            route = PAGE_ROUTES.RETIREMENT_DEFINITION;
            fields = {
                sysId
            };
            params = { ts: Date.now() };
        } else if (table == CMDB_TABLE_NAMES.CMDB_DEDUPE_TASK) {
            route = PAGE_ROUTES.DE_DUPE_TASK_DETAILS;
            fields = {
                table: table,
                sysId: sysId
            };
        } else {
            route = 'record';
            params = {};
            fields = {
                table,
                sysId
            };
        }

        helpers.navigate.to(
            route, 
            fields, 
            params, 
            null, 
            null, 
            'current'
        );
    }
    
    const APPRX_TIME_TO_MIGRATE_ONE_CERT_SCH = 300;
    const DEFAULT_MIN_TIME = 1;

    var _formatDurationMilliSeconds = function(milliseconds, options = {}, setDefaultMinTime) {
        const {
            count = 1,
            units: {
                s = 's',
                m = 'm',
                h = 'h',
                d = 'd',
            } = {},
        } = options;
        const final = [];
        let days;
        let hours;
        let minutes;
        let seconds;
        // If milliseconds comes as 0 or less than 1000, just return '0 s'
        if (!milliseconds || milliseconds < 1000) {
            return setDefaultMinTime ? DEFAULT_MIN_TIME + ' ' + s : '0' + ' ' + s;
        }
        seconds = Math.floor(milliseconds / 1000);
        minutes = Math.floor(seconds / 60);
        seconds %= 60;
        hours = Math.floor(minutes / 60);
        minutes %= 60;
        days = Math.floor(hours / 24);
        hours %= 24;
        if (days)
            final.push(days + ' ' + d);
        if (hours)
            final.push(hours + ' ' + h);
        if (minutes)
            final.push(minutes + ' ' + m);
        if (seconds)
            final.push(seconds + ' ' + s);
        return final.slice(0, count).join(' ');
    }

   /**
   * This method removes any keys with null or undefined values and converts all the values to string. If the value is an object, recursively calls the sane method
   */
    const _sanitizeNavigationPayload = function(obj) {
        const result = {};
        if (!obj) return result;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
                    result[key] = _sanitizeNavigationPayload(obj[key]);
                } else if (obj[key] != null || obj[key] != undefined) {
                    result[key] = obj[key] + '';
                }
            }
        }
        return result;
    }

     const _getReferenceFieldRoute = (field, data) => {
        const routes = {};
        routes[field] = {
            route: PAGE_ROUTES.RECORD,
            fields: {
                table: data.referenceTable,
                sysId: data.value
            }
        };
        return routes[field];
    }

    const _handleWorkloadRefClicked = async function (event, helpers, isAdmin) {
      let userOrGroupsFieldDisplayValue = ""
      const baseFilter = "stateIN1,2^policy_id.cmdb_policy_type=" + DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION;
      let tasksFilter = "";
      if (event.payload.row.rowData.value.has("user_group")) {
          userOrGroupsFieldDisplayValue = event.payload.row.rowData.value.get("user_group").columnData.displayValue;
          const fieldValue = event.payload.row.rowData.value.get("user_group").columnData.value;
          tasksFilter = `${baseFilter}^assignment_group=${fieldValue}`;
          if (!isAdmin) {
            tasksFilter += '^assigned_toISEMPTY^ORassigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORassigned_to.managerDYNAMIC90d1921e5f510100a9ad2572f2b477fe';
          }
      } else if (event.payload.row.rowData.value.has("user")) {
          userOrGroupsFieldDisplayValue = event.payload.row.rowData.value.get("user").columnData.displayValue;
          const fieldValue = event.payload.row.rowData.value.get("user").columnData.value;
          tasksFilter = `${baseFilter}^assigned_to=${fieldValue}`;
      }

      const value = {
          type: LINK_TYPES.ROUTE,
          href: HREF_FOR_ROUTE_TYPE,
          openNewWindow: false,
          route: {
              route: PAGE_ROUTES.LIST,
              fields: {
                  table: CMDB_TABLE_NAMES.CMDB_DATA_MANAGEMENT_TASK
              },
              params: {
                  listTitle: await helpers.translate("Tasks assigned to {0}", userOrGroupsFieldDisplayValue),
                  fixedFilter: tasksFilter,
                  view: 'cmdb_ws',
                  hideActions: true
              }
          }
      };
      return value;
    }

    const _agingTaskDrillDownListNav = async function (event, helpers, isAdmin) {
      var table = CMDB_TABLE_NAMES.CMDB_DATA_MANAGEMENT_TASK;
      var title = "undefined";
      var columns = "";
      var view = "cmdb_ws";
      var fixedFilter = 'active=true^state!=8^policy_id.cmdb_policy_type=' + DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION;
      var userGroupBaseCondition = 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^ORassignment_group.managerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORassigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORassigned_to.managerDYNAMIC90d1921e5f510100a9ad2572f2b477fe';
      if (!isAdmin) {
          fixedFilter += '^' + userGroupBaseCondition;
      }
      var query = event.payload?.payload?.params?.query;
      var filterArr = query.split("^");
      for(var i = 0; i < filterArr.length; i++) {
          var filter = filterArr[i];
          var splitFilter = filter.split("=");
          if(splitFilter[0] === "dynamic_group_by") {
              var ageRange = splitFilter[1]; //parse ageRange into query
              if(ageRange.indexOf(">") != -1) {
                  var days = ageRange.match(/(\d+)/)[0]; //get digit value out of the label
                  fixedFilter += '^opened_at<javascript:gs.daysAgo(' + days + ')';
              } else if(ageRange.indexOf(" - ") != -1) {
                  var dates = ageRange.split(" - ");
                  var startRange = parseInt(dates[0].match(/(\d+)/)[0]) - 1;
                  var endRange = dates[1].match(/(\d+)/)[0];
                  fixedFilter += '^opened_at<javascript:gs.daysAgo(' + startRange + ')'
                  + '^opened_at>=javascript:gs.daysAgo(' + endRange  + ')';
              }
          }
      }
      title = await helpers.translate("Aging tasks");

      const value = {
          type: LINK_TYPES.ROUTE,
          href: HREF_FOR_ROUTE_TYPE,
          openNewWindow: false,
          route: {
              route: PAGE_ROUTES.LIST,
              fields: {
                  table: table
              },
              params: {
                  listTitle: title,
                  fixedFilter: fixedFilter,
                  view: view, 
                  columns: columns,
                  hideActions: true
              }
          }
      };

      return value;
    }

    return {
        CMDB_TABLE_NAMES,
        DM_POLICY_TYPE_IDS,
        BASE_AGG_POLICY_TYPE_GROUP_BY_VALUE_TO_ID,
        DM_POLICY_STATUS,
        DM_TASK_STATE,
        DM_PAGE_TABS,
        DM_POLICIES_PAGE_SUBTABS,
        MAX_NUM_QUICK_LINKS,
        DATA_INGESTION_TAB_ID,
        TABLE_NAMES,
        LINK_TYPES,
        PAGE_ROUTES,
        HREF_FOR_ROUTE_TYPE,
        DM_PROPERTY_NAMES,
        OPERATORS,
        FIELD_TYPES,
        APPRX_TIME_TO_MIGRATE_ONE_CERT_SCH,
        openMyWorkTaskRecordInNewTab: _openMyWorkTaskRecordInNewTab,
        getFieldValueFromEncodedQuery: _getFieldValueFromEncodedQuery,
        handleLinkClick: _handleLinkClick,
        formatLastUpdInfoText: _formatLastUpdInfoText,
        buildFieldMetadata: _buildFieldMetadata,
        handleReferenceLinkClickEvent,
        sanitizeNavigationPayload: _sanitizeNavigationPayload,
        formatDurationMilliSeconds: _formatDurationMilliSeconds,
        getReferenceFieldRoute: _getReferenceFieldRoute,
        handleWorkloadRefClicked: _handleWorkloadRefClicked,
        agingTaskDrillDownListNav: _agingTaskDrillDownListNav
    };
}
