var SNHelpSetupMigrationUtil = Class.create();

SNHelpSetupMigrationUtil.prototype = {

    initialize: function() {
        this.constants = new sn_ads_setup.SNHelpSetupConstantProvider();
        this.setupController = new sn_ads_setup.SNHelpSetupController();
        this.snHelpService = new global.SNHelpService();
        this.stepMap = {};
    },

    getActivityDefAndInput: function(task, activityId) {
        var activityDefId = this.constants.activityDefId.INSTRUCTION;
        var input = {};
        var taskType = task.configuration_types;
        var dependencies = task.dependenciesObj && task.dependenciesObj.filter(function(dependency) {
            return dependency.parent == task.parent;
        }).map(function(dependency) {
            return this.stepMap[dependency.id];
        }, this);

        switch (taskType) {
            case this.constants.gsTaskType.EXTERNAL_LINK:
                var relatedContent = task.content.related_content;
                if (relatedContent && relatedContent.length) {
                    activityDefId = this.constants.activityDefId.EXTERNAL_LINK;
                    input = {
                        "variables": [{
                            "variableValue": JSON.stringify(relatedContent),
                            "variableMapping": "",
                            "variableName": "external_links"
                        }]
                    };
                }
                break;
            case this.constants.gsTaskType.IFRAME:
                var url = task.content.url;
                if (url) {
                    activityDefId = this.constants.activityDefId.IFRAME;
                    input = {
                        "variables": [{
                            "variableValue": url,
                            "variableMapping": "",
                            "variableName": "url"
                        }]
                    };
                }
                break;
            case this.constants.gsTaskType.TABLE:
                var tableName = task.content.table_name;
                var view = task.content.view;
                if (tableName && view) {
                    activityDefId = this.constants.activityDefId.TABLE;
                    input = {
                        "variables": [{
                                "variableValue": tableName,
                                "variableMapping": "",
                                "variableName": "table"
                            },
                            {
                                "variableValue": view,
                                "variableMapping": "",
                                "variableName": "form_view"
                            }
                        ]
                    };
                }
                break;
            case this.constants.gsTaskType.PLUGINS:
                var records = task.content.records;
                if (records) {
                    activityDefId = this.constants.activityDefId.PLUGINS;
                    var pluginIds = records.split(',');
                    var pluginQuery = "idLIKE" + pluginIds.join("^ORidLIKE");
                    input = {
                        "variables": [{
                            "variableValue": pluginQuery,
                            "variableMapping": "",
                            "variableName": "plugin_query"
                        }]
                    };
                }
                break;
        }

        return {
            activityDefId: activityDefId,
            input: input,
            dependencies: dependencies
        };
    },



    getActivities: function(tasks, processId) {
        return tasks.map(function(task) {
            var activityId = gs.generateGUID().toString();
            this.stepMap[task.id] = activityId;
            var taskInfo = this.getActivityDefAndInput(task, activityId);
            var dep = taskInfo.dependencies;
            return {
                "label": task.name,
                "description": task.description,
                "lane": this.stepMap[task.parent],
                "processDefinition": processId,
                "activityDefinition": taskInfo.activityDefId,
                "startRule": {
                    "definition": (dep && dep.length) ? this.constants.activityStartRule.AFTER_ACTIVITY : this.constants.activityStartRule.IMMEDIATE,
                    "vars": {
                        "activities": dep
                    }
                },
                "restartRule": {
                    "value": "RUN_ALWAYS",
                    "displayValue": "Run always"
                },
                "inputs": taskInfo.input,
                "order": task.order,
                "sysId": activityId
            };
        }, this);
    },

    getDescription: function(step) {
        var related_content = step.content && step.content.related_content;
        if (!related_content)
            return step.description;

        var htmlDescription = '<div>';
        htmlDescription += '<div>' + step.description + '</div>';
        htmlDescription += '</br>';
        var relatedLinksTitle = gs.getMessage('Related Links');
        htmlDescription += '<div>' + relatedLinksTitle + '</div>';
        related_content.forEach(function(link) {
            htmlDescription += '<a href="' + link.url + '" target="_blank">' + link.title + '</a><br>';
        });
        htmlDescription += '</div>';
        return htmlDescription;
    },

    getLanes: function(steps, processId) {
        var lanes = steps.map(function(step) {
            var stepId = gs.generateGUID().toString();
            this.stepMap[step.id] = stepId;
            var currentLaneObj = {
                "label": step.name,
                "description": this.getDescription(step),
                "processDefinition": processId,
                "startRule": {
                    "definition": this.constants.laneStartRule.IMMEDIATE,
                    "vars": {}
                },
                "restartRule": {
                    "value": "RUN_ALWAYS",
                    "displayValue": "Run always"
                },
                "order": step.order,
                "sysId": stepId
            };
            return currentLaneObj;
        }, this);
        return lanes;
    },

    getProcessDetails: function(setupDetail, processId) {
        return ({
            "sysId": processId,
            "label": setupDetail.setupName,
            "description": setupDetail.description,
            "sysScope": setupDetail.sysScope,
            "triggerRecordData": {
                "triggerType": {
                    "value": this.constants.triggerType.CREATE_OR_UPDATE
                },
                "triggerInstanceId": this.snHelpService.insertTriggerRecord(setupDetail.setupName, processId),
                "inputs": {
                    "variables": [{
                            "variableName": "table",
                            "variableValue": this.constants.tables.user_interaction,
                            "variableMapping": null
                        },
                        {
                            "variableName": "condition",
                            "variableValue": "guidance.process_definition=" + processId,
                            "variableMapping": null
                        },
                        {
                            "variableName": "run_on_extended",
                            "variableValue": "false",
                            "variableMapping": null
                        }
                    ]
                }
            }
        });
    },

    getProcessMetaData: function(guidanceRecord, processId) {
        this.stepMap = {};
        var setupDetail = this.setupController.getGuidanceSummary(guidanceRecord.getUniqueValue());
        return ({
            "process": this.getProcessDetails(setupDetail, processId),
            "lanes": this.getLanes(setupDetail.steps, processId),
            "activities": this.getActivities(setupDetail.tasks, processId)
        });
    },

    deleteInteractionRecords: function(guidanceId) {
        var hui = new GlideRecord('help_user_interaction');
        hui.addQuery('guidance', guidanceId);
        hui.query();
        while (hui.next()) {
            hui.deleteRecord();
        }
    },

    type: 'SNHelpSetupMigrationUtil'
};
