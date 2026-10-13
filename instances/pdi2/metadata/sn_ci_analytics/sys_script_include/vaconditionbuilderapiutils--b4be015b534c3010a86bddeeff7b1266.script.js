var VAConditionBuilderAPIUtils = Class.create();
VAConditionBuilderAPIUtils.prototype = {
    initialize: function() {
        this.cache = {};
    },

    getAppseeAPIResponse: function(appseeApiPayload) {
        var body, response;
        try {
            if (appseeApiPayload.dynamic_property_name) {
                body = {
                    platform: "chat",
                    dynamic_property_name: appseeApiPayload.dynamic_property_name
                };
                response = this.getAnalyticsApiResponse("Session", "getDynamicPropertyUniqueValues", body);
            } else if (appseeApiPayload.event_type_filter) {
                body = {
                    platform: "chat",
                    event_type_filter: appseeApiPayload.event_type_filter
                };
                response = this.getAnalyticsApiResponse("Event", "getEventNamesByType", body);
                response = response[appseeApiPayload.event_type_filter];
            } else if (appseeApiPayload.event_property_name && appseeApiPayload.event_type) {
                body = {
                    platform: "chat",
                    event_property_name: appseeApiPayload.event_property_name,
                    event_type: appseeApiPayload.event_type
                };
                response = this.getAnalyticsApiResponse("Event", "getEventNamesByEventPropertyValues", body);
                if (appseeApiPayload.fieldInternalValue) {
                    response = this.transformTopicSubCategoryData(response, appseeApiPayload.fieldInternalValue);
                }
                if (appseeApiPayload.tableName === 'topic_node_filter') {
                    // TEMP COMMENT :
                    // Its possible to not have the topicNodeName while rebuilding conditions.
                    // Since we are only storing internal values and rebuilding conditions recursively
                    // child rows dont have context of parent row's node name. One way we can have the node
                    // name on the fly is by saving it in the dropdown id's. otherwise make an API call and 
                    // get the node name by filtering based on node id which is costly. Suggestions ? 
                    var topicNodeName = appseeApiPayload.topicNodeName;
                    if (!topicNodeName) {
                        var screens = this.getAnalyticsApiResponse("Screen", "getScreens", {
                            screen_type: '4'
                        });
                        for (var i in screens) {
                            if (screens[i].Name.indexOf(appseeApiPayload.topicNodeId) > -1) {
                                topicNodeName = screens[i].DisplayName;
                            }
                        }
                    }
                    response = this.getTopicNodeSelectedValues(response, appseeApiPayload.topicNodeId, topicNodeName, appseeApiPayload.nodeType);
                }
            } else if (appseeApiPayload.event_name) {
                body = {
                    platform: "chat",
                    event_name: appseeApiPayload.event_name
                };
                response = this.getAnalyticsApiResponse("Event", "getEventPropertyNames", body);
            } else if (appseeApiPayload.language) {
                body = {
                    platform: "chat"
                };
                response = this.getAnalyticsApiResponse("Session", "getAnalyticsSessionTranslatedLocale", body);
            } else if (appseeApiPayload.screen_type) {
                if (appseeApiPayload.screen_type == '4') {
                    body = {
                        platform: appseeApiPayload.platform,
                        screen_type: appseeApiPayload.screen_type
                    };
                    response = this.getAnalyticsApiResponse("Screen", "getScreens", body);
                    var screens = this.getAnalyticsApiResponse("Screen", "getScreens", {
                        platform: '3',
                        screen_type: '3'
                    });
                    var typeToTopicNodeMapping = this.getAnalyticsApiResponse("Event", "getEventNamesByEventPropertyValues", {
                        event_type: 'Topic Node',
                        event_property_name: 'Type'
                    });
                    var topicNodeToTypeMapping = this.getTopicNodeToTypeMapping(typeToTopicNodeMapping);
                    var selectedScreenId;
                    if (appseeApiPayload.screenId) {
                        selectedScreenId = appseeApiPayload.screenId;
                    } else {
                        for (var i in screens) {
                            if (screens[i].DisplayName === appseeApiPayload.topicName) {
                                selectedScreenId = screens[i].Name;
                                break;
                            }
                        }
                    }
                    var options = [];
                    response.forEach(function(topicNode) {
                        if (topicNode.Name.indexOf(selectedScreenId) > -1) {
                            var screenData = {
                                appId: topicNode.AppId.$oid,
                                platform: 3,
                                screenName: topicNode.Name,
                                nodeType: topicNodeToTypeMapping[topicNode.DisplayName]
                            };

                            options.push({
                                id: JSON.stringify(screenData),
                                label: topicNode.DisplayName
                            });
                        }
                    });
                    response = options;
                } else if (appseeApiPayload.screen_type == '3') {
                    body = {
                        platform: appseeApiPayload.platform,
                        screen_type: appseeApiPayload.screen_type
                    };
                    response = this.getAnalyticsApiResponse("Screen", "getScreens", body);
                    response.sort(function(a, b) {
                        var nameA = a["DisplayName"].toLowerCase();
                        var nameB = b["DisplayName"].toLowerCase();
                        if (nameA < nameB) return -1;
                        if (nameA > nameB) return 1;
                        return 0;
                    });
                }
            }
            return response;
        } catch (ex) {
            gs.error(ex);
            gs.addErrorMessage(ex.message);
        }
    },

    transformTopicSubCategoryData: function(data, topicSubCategory) {
        return data && data[topicSubCategory] ? data[topicSubCategory] : [];
    },

    getTopicNodeToTypeMapping: function(typeToTopicNodeMapping) {
        var topicNodeToTypeMapping = {};
        Object.keys(typeToTopicNodeMapping).forEach(function(typeKey) {
            typeToTopicNodeMapping[typeKey].forEach(function(topicNode) {
                if (!topicNodeToTypeMapping[topicNode]) {
                    topicNodeToTypeMapping[topicNode] = typeKey;
                }
            });
        });
        return topicNodeToTypeMapping;
    },

    getTopicNodeSelectedValues: function(selectedValuesToTopicNodeMapping, topicNodeId, topicNodeName, topicNodeType) {
        var selectedValues = [];
        Object.keys(selectedValuesToTopicNodeMapping).forEach(function(selectedValue) {
            selectedValuesToTopicNodeMapping[selectedValue].forEach(function(topicNode) {
                if (topicNode === topicNodeName) {
                    selectedValues.push({
                        id: JSON.stringify({
                            topic_node_id: topicNodeId,
                            topic_node_name: topicNodeName,
                            type: topicNodeType,
                            id: selectedValue
                        }),
                        label: selectedValue
                    });
                }
            });
        });
        return selectedValues;
    },

    getAnalyticsApiResponse: function(serviceType, serviceName, params) {
        var obj = {
            type: serviceType,
            name: serviceName,
            params: params
        };
        var key = JSON.stringify(obj);
        if (this.cache[key])
            return this.cache[key];

        var response = AnalyticsServiceInvoker.invoke(serviceType, serviceName, params);
        this.cache[key] = response;

        return response;
    }

};
