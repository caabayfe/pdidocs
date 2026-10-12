function include({ imports }) {

    class SOWLandingPageTier2UtilsSNC {

        /**
         * Returns visualization config's
         * @param {object} helpers
         * @param {string} mode
         * @param {number} conditionalRecordCount
         * @return object
         */
        static async getVisualizationConfig(helpers, mode, conditionalRecordCount) {
            const visualizationConfig = [{
                "id": "incidentAssigned",
                "tableName": "incident",
                "tableDisplayValue": "Incident",
                "myWorkQuery": "active=true^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^state!=6",
                "myTeamQuery": "active=true^assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^state!=6",
                "header": mode == 'your_work' ? await helpers.translate("Incidents assigned to you") : await helpers.translate("Incidents assigned to your team"),
                "groupByField": "state",
                "evamId": "01a404e8b7203010e69dbc16de11a93f",
                "updated_on": "^ORDERBYDESCsys_updated_on",
                "roles":mode == "your_work" ? ["itil","sn_incident_write"] : ["itil","sn_incident_read"],
            },
            {
                "id": "problemsAssigned",
                "tableName": "problem",
                "tableDisplayValue": "Problem",
                "myWorkQuery": "active=true^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe",
                "myTeamQuery": "active=true^assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744",
                "header": mode == 'your_work' ? await helpers.translate("Problems assigned to you") : await helpers.translate("Problems assigned to your team"),
                "groupByField": "state",
                "evamId": "5f0697b8f49bc510f8773ad5bd0ae292",
                "updated_on": "^ORDERBYDESCsys_updated_on",
                "roles":mode == "your_work" ? ["itil","problem_coordinator"] : ["itil","sn_problem_read","problem_task_analyst"],
            },
            {
                "id": "changesAssigned",
                "tableName": "change_request",
                "tableDisplayValue": "Change Request",
                "myWorkQuery": "active=true^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe",
                "myTeamQuery": "active=true^assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744",
                "header": mode == 'your_work' ? await helpers.translate("Changes assigned to you") : await helpers.translate("Changes assigned to your team"),
                "groupByField": "state",
                "evamId": "e1f06c4194130110f87765e94545da91",
                "updated_on": "^ORDERBYDESCsys_updated_on",
                "roles":mode == "your_work" ? ["itil","sn_change_write"] : ["itil","sn_change_read"],
            },
            {
                "id": "taskAssigned",
                "tableName": "task",
                "tableDisplayValue": "Task",
                "myWorkQuery": "active=true^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^sys_class_name=incident_task^ORsys_class_name=problem_task^ORsys_class_name=change_task^ORsys_class_name=sc_task",
                "myTeamQuery": "active=true^assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^sys_class_name=incident_task^ORsys_class_name=problem_task^ORsys_class_name=change_task^ORsys_class_name=sc_task",
                "header": mode == 'your_work' ? await helpers.translate("Tasks assigned to you") : await helpers.translate("Tasks assigned to your team"),
                "groupByField": "sys_class_name",
                "evamId": "615d205d94df0110f87765e94545da03",
                "updated_on": "^ORDERBYDESCsys_updated_on",
                "roles":mode == "your_work" ? ["itil","sn_incident_write","sn_incident_task_assigned_user","problem_task_analyst","sn_change_write","sn_change_task_assigned_user","sn_request_write"] : ["itil","sn_incident_read","sn_incident_task_assigned_user","sn_problem_read","problem_task_analyst","sn_change_read","sn_change_task_assigned_user","sn_request_read","catalog"],
            }];

            if(mode=='your_work' && conditionalRecordCount>0){
                const conditionalConfig = await this.getConditionalVisualizationConfig(helpers);
                visualizationConfig.push(conditionalConfig);
            }

            return visualizationConfig;
        }
        

        /**
         * Returns conditional visualization config
         * @param {object} helpers
         * @return object
         */
         static async getConditionalVisualizationConfig(helpers) {
            const visualizationConfig = {
                    "id": "delegated_task",
                    "tableName": "task",
                    "tableDisplayValue": "Task",
                    "myWorkQuery": "active=true^assigned_to=javascript:getMyAssignments()^assigned_to.sys_id!=javascript: gs.getUserID()^sys_class_name=incident^ORsys_class_name=problem^ORsys_class_name=change_request^ORsys_class_name=incident_task^ORsys_class_name=problem_task^ORsys_class_name=change_task^ORsys_class_name=sc_task",
                    "myTeamQuery": "active=true^assigned_to=javascript:getMyAssignments()^assigned_to.sys_id!=javascript: gs.getUserID()^sys_class_name=incident^ORsys_class_name=problem^ORsys_class_name=change_request^ORsys_class_name=incident_task^ORsys_class_name=problem_task^ORsys_class_name=change_task^ORsys_class_name=sc_task",
                    "listView": "sow_landing_page_assigned",
                    "header": await helpers.translate("Tasks delegated to you"),
                    "groupByField": "sys_class_name",
                    "evamId": "615d205d94df0110f87765e94545da03",
                    "updated_on": "^ORDERBYDESCsys_updated_on",
                    "roles":["itil", "sn_incident_write", "problem_coordinator", "sn_change_write","sn_incident_task_assigned_user", "problem_task_analyst", "sn_change_task_assigned_user", "sn_request_write"],
                };
            return visualizationConfig;
        }

        /**
         * Build visualization card configurations (Dounut)
         * @param {object} helpers
         * @param {string} mode
         * @param {number} conditionalRecordCount
         * @return object
         */
        static async getDonutConfig(helpers, mode, conditionalRecordCount,api) {
            var donutConfig = [];
            var visualizationConfig = await this.getVisualizationConfig(helpers, mode, conditionalRecordCount);

            for (var i = 0; i < visualizationConfig.length; i++) {
                var obj = {};
                var visibility = api ? this.containsRole(api.context.session.user.roles, visualizationConfig[i]["roles"]) : true;
                if(visibility){
                    obj = {
                        "id": visualizationConfig[i].id,
                        "header": visualizationConfig[i].header,
                        "evamId": visualizationConfig[i].evamId,
                        "updated_on": visualizationConfig[i]["updated_on"],
                        "datasource": [{
                            "isDatabaseView": false,
                            "allowRealTime": true,
                            "sourceType": "table",
                            "label": {
                                "message": visualizationConfig[i].tableDisplayValue
                            },
                            "tableOrViewName": visualizationConfig[i].tableName,
                            "filterQuery": mode == 'your_work' ? visualizationConfig[i].myWorkQuery : visualizationConfig[i].myTeamQuery,
                            "id": visualizationConfig[i].id
                        }],
                        "metric": [{
                            "dataSource": visualizationConfig[i].id,
                            "id": visualizationConfig[i].id + "metric",
                            "aggregateFunction": "COUNT",
                            "numberFormat": {
                                "customFormat": false
                            },
                            "axisId": "primary"
                        }],
                        "groupBy": [{
                            "maxNumberOfGroups": "ALL",
                            "numberOfGroupsBasedOn": "NO_OF_GROUP_BASED_ON_PER_METRIC",
                            "showOthers": false,
                            "groupBy": [{
                                "dataSource": visualizationConfig[i].id,
                                "groupByField": visualizationConfig[i].groupByField,
                                "isRange": false,
                                "isPaBucket": false
                            }]
                        }]
                    };
                    donutConfig.push(obj);
                }
            }
            return donutConfig;
        }

        /**
         * Returns initial visualization config
         * @param {object} helpers
         * @return object
         */
        static getInitialVisualizationConfig() {
            const visualizationConfig = {
                "table": "incident",
                "elementId": "incidentAssigned",
                "title": "Incidents assigned to you",
                "query": "active=true^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^state!=6^ORDERBYDESC$AGGREGATE$^ORDERBYDESCsys_updated_on",
                "evamId": "01a404e8b7203010e69dbc16de11a93f",
                "recordCount": 0,
                "groupByField": "state"
            };
            return visualizationConfig;
        }

        /**
         * Returns configuration for work persona dropdown
         * @param {object} helpers
         * @return {object}
         */
        static async getWorkPersonaConfig(helpers) {
            return {
                "items": [
                    {
                        "id": "your_work",
                        "label": await helpers.translate("Your work")
                    },
                    {
                        "id": "your_team_work",
                        "label": await helpers.translate("Your team's work")
                    }],
                "defaultSelected": ["your_work"]
            }
        }

        static containsRole(userRoles, widgetRoles) {
            return userRoles.some(item => widgetRoles.includes(item));
        }

        static async fetchTitle(table, nameValueMap, groupMode = false, elementId) {
            if(table === "task") {
                return this.getLabelMaps(table, nameValueMap['sys_class_name'], groupMode, elementId);
            }
            return this.getLabelMaps(table, nameValueMap['state'], groupMode, elementId);
        }

        static getLabelMaps(table, selectedField, groupMode = false, elementId) {
            if(selectedField == undefined){
                selectedField = 'all';
             }
            const labelMap = {
                'incident': {
                    '1': 'New incidents',
                    '2': 'In Progress incidents',
                    '3': 'On Hold incidents',
                    '6': 'Resolved incidents',
                    'all':'Incidents'
                },
                'change_request': {
                    '0': 'In Review changes',
                    '-1': 'Implement changes',
                    '-2': 'Scheduled changes',
                    '-3': 'Authorize changes',
                    '-4': 'Assess changes',
                    '-5': 'New changes',
                    'all':'Changes'
                },
                'problem': {
                    '101': 'New problems',
                    '102': 'Assess problems',
                    '106': 'Resolved problems',
                    '104': 'Fix in Progress problems',
                    '103': 'Root Cause Analysis problems',
                    'all':'Problems'
                },
                'task': {
                    'incident_task': 'Incident tasks',
                    'problem_task': 'Problem tasks',
                    'change_task': 'Change tasks',
                    'sc_task': 'Catalog tasks',
                    'incident': 'Incidents',
                    'problem': 'Problems',
                    'change_request': 'Change requests',
                    'all':'Tasks'
                }
            };
            if(elementId === 'delegated_task')
                return labelMap[table][selectedField] + ' delegated to you';
            if (groupMode)
                return labelMap[table][selectedField] + ' assigned to your team';
            return labelMap[table][selectedField] + ' assigned to you';
        }

        static async getVisualisationCardConfig(id, helpers, mode, conditionalRecordCount) {
            var visualizationConfig = await this.getVisualizationConfig(helpers, mode, conditionalRecordCount);
            var currentVizSelection = {};
            for (var i = 0; i < visualizationConfig.length; i++) {
                if(visualizationConfig[i].id === id) {
                    currentVizSelection.table = visualizationConfig[i].tableName;
                    currentVizSelection.query = mode === "your_team_work" ? visualizationConfig[i].myTeamQuery + visualizationConfig[i]["updated_on"] : visualizationConfig[i].myWorkQuery + visualizationConfig[i]["updated_on"]; 
                    currentVizSelection.evamId = visualizationConfig[i].evamId;
                    currentVizSelection.elementId = visualizationConfig[i].id;
                    currentVizSelection.title = visualizationConfig[i].header;
                    break;
                }
            }
            return currentVizSelection;
        }

        static async getVisualisationCardQuery(vizSelection, nameValueMap, helpers, mode, conditionalRecordCount) {
            const fieldMap = {
                'State': 'state',
                'Task type': 'sys_class_name'
            };
            var field = fieldMap[vizSelection.groupBy] !== undefined ? fieldMap[vizSelection.groupBy] : vizSelection.groupByField;
            var value = nameValueMap[field];
            var query = '';
            var visualizationConfig = await this.getVisualizationConfig(helpers, mode, conditionalRecordCount);
            for (var i = 0; i < visualizationConfig.length; i++) {
                if(visualizationConfig[i].id === vizSelection.elementId) {
                    query = mode === "your_team_work" ? visualizationConfig[i].myTeamQuery : visualizationConfig[i].myWorkQuery; 
                    break;
                }
            }
            if (Array.isArray(value)) {
                for (let index in value)
                    query += '^' + field + value[index];
            } else {
                if (value.includes('='))
                    query += '^' + field + value;
                else
                    query += '^' + field + '=' + value;
            }
            return query + visualizationConfig[0]["updated_on"];
        }
    }

    return SOWLandingPageTier2UtilsSNC;
}
