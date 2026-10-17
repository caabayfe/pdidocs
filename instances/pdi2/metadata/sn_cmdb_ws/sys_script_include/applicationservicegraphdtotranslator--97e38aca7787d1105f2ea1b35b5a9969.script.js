var ApplicationServiceGraphDTOTranslator = Class.create();
ApplicationServiceGraphDTOTranslator.prototype = {
    DEFAULT_NODE_LAYER: "infrastructure",
    SA_MAP_VIEW_PROPERTIES_CACHE: "SA_MAP_VIEW_PROPERTIES_CACHE",
    CLUSTER_ID_SEPARATOR: ":",

    initialize: function() {
        this.applicationServiceAPI = new global.ApplicationServiceGraphDataAPIs();
        this.MAX_CHUNK_SIZE = parseInt(gs.getProperty('sn_cmdb_ws.sm.max_chunk_to_query', '500'));
        this.SKIP_ERROR_NODES = gs.getProperty('sn_cmdb_ws.sm.skip_error_nodes', "true");
        this.MAX_NODES = parseInt(gs.getProperty('sn_cmdb_ws.node.map.max.edge.count', "250"));
        this.DEFAULT_LEVEL = parseInt(gs.getProperty('sn_cmdb_ws.sm.default_level', "5"));

        this.log = new global.GSLog("com.snc.sn_cmdb_ws.log.level", this.type);

        this.baseParametersForNodesDefault = {
            "cmdb_ci": ["sys_class_name", "owned_by", "operational_status", "life_cycle_stage", "life_cycle_stage_status", "discovery_source", "last_discovered", "sys_updated_on"]
        };
        this.baseParametersForEdgesDefault = {
            "cmdb_ci_endpoint": ["ip_address", "port", "sys_class_name"]
        };

        this.digest = new GlideDigest();
        this.propertiesForFieldValues = ["sys_class_name"];
        this.parentToChild = {};
        this.mapBase = new MapBase();
        this.mapService = new MapService();
        this.fetchHosts = false;
        this.propNeedsInternalId = ["discovery_source"];
    },

    /**
     *
     *  get application service graph json as per contract with cmdb workspace to display node map.
     *  @param  {JSON}      bsId - Application service sys id.
     *                      showLargeMap - true will return entire map even if max nodes limit exceeded else return error.
     *                      baseParametersForNodes  - key - class name
     *                                              - value - array of properties needed for that ci and its child classes.
     *                      propertiesWithBothDisplayAndFieldValues - array of properties for which we need both field value and display value.
     *  @return {JSON} if user is restricted for service it will return true else false.
     **/
    getGraphDTO: function(requestJson) {
        try {
            if (!requestJson.bsId) {
                this._throwError(gs.getMessage("Application service id is mandatory in request parameters: {0}", JSON.stringify(requestJson)));
            }
            if (!requestJson.getIconFromClass) {
                this._throwError(gs.getMessage("Method to fetch icons is mandatory input: {0}", JSON.stringify(requestJson)));
            }

            var level = requestJson.level ? requestJson.level : this.DEFAULT_LEVEL;

            var parameters = {
                bsId: requestJson.bsId,
                maxLevels: level,
                maxNodes: this.MAX_NODES,
                showLargeMap: 'true'
            };

            var serviceMappingInput = requestJson.serviceMappingInput;
            var isSowMap = serviceMappingInput && serviceMappingInput.isSowMap;

            if (isSowMap) {
                parameters.allowAlertPath = !!serviceMappingInput.allowAlertPath;
                parameters.maxNodes = serviceMappingInput.isExtendedCiLimit ?
                    this.MAX_NODES :
                    parseInt(gs.getProperty('sn_sow_em_um.unified_map_max_nodes', '60'));

                //DEF0539119: reset maxLevels for SOW map, don't bring it from the URL. For truncated map display.
                parameters.maxLevels = parseInt(gs.getProperty('sn_cmdb_ws.unifiedmap.map_search_filter.max_levels', '25'));

                parameters.cisForAlertPath = serviceMappingInput.cisForAlertPath || '';
            }

            this.fetchHosts = !isSowMap;

            if (this.log.debugOn())
                this.log.debug('getGraphDTO params=\n' + JSON.stringify(parameters, null, 2));

            var MSG_HEADER_GENERIC_ERR = gs.getMessage('The impacted path that you selected cannot be displayed.');
            var MSG_CONTENT_GENERIC_ERR = gs.getMessage('Select another alert or Clear selection.');

            var MSG_HEADER_LEVELS_OVERFLOW_ERR = gs.getMessage('Unable to update map display');
            var MSG_CONTENT_LEVELS_OVERFLOW_ERR = gs.getMessage('The impacted path has exceeded {0} levels. Select another alert or Clear selection.', parseInt(parameters.maxLevels).toString());


            var serviceMappingGraphJSON = JSON.parse(this.applicationServiceAPI.getApplicationServiceApiResponse("getMap", parameters));

            var outputFlags = {
                cisForAlertPath: serviceMappingGraphJSON.cisForAlertPath,
                isReducedAlertPath: serviceMappingGraphJSON.isReducedAlertPath,
                isTruncated: serviceMappingGraphJSON.isTruncated,
                errorState: serviceMappingGraphJSON.errorState,
                maxNodes: parameters.maxNodes //returned for user message in case isTruncated=true
            };

            if (this.log.debugOn())
                this.log.debug('getGraphDTO outputFlags=\n' + JSON.stringify(outputFlags, null, 2));


            if (isSowMap && outputFlags.errorState &&
                (!serviceMappingGraphJSON.nodes || serviceMappingGraphJSON.nodes.length === 0)) {

                var headerText = outputFlags.errorState === 'ERR_MAX_LEVELS_OVERFLOW' ?
                    MSG_HEADER_LEVELS_OVERFLOW_ERR :
                    MSG_HEADER_GENERIC_ERR;

                var messageText = outputFlags.errorState === 'ERR_MAX_LEVELS_OVERFLOW' ?
                    MSG_CONTENT_LEVELS_OVERFLOW_ERR :
                    MSG_CONTENT_GENERIC_ERR;

                throw {
                    code: 'CMDBUM-500-002',
                    //'message' is in the browser console only, no translate
                    message: 'Unable to update map display. Error state: ' + outputFlags.errorState,
                    uiMessage: {
                        severity: 'critical',
                        message: messageText,
                        header: headerText,
                        errorState: outputFlags.errorState //needed for UM scripts, not for the message display
                    }
                };
            }

            var baseParametersForNodes = (requestJson.baseParametersForNodes && Object.keys(requestJson.baseParametersForNodes).length != 0) ? requestJson.baseParametersForNodes : this.baseParametersForNodesDefault;
            this.propertiesForFieldValues = requestJson.propertiesForFieldValues ? requestJson.propertiesForFieldValues : this.propertiesForFieldValues;
            this.iconMethod = requestJson.getIconFromClass;
            var mapRawData = this._transformToCMDBMap(requestJson.bsId, serviceMappingGraphJSON, baseParametersForNodes, level);
            mapRawData.mapInfo = outputFlags;
            if (!isSowMap && (outputFlags.isTruncated || this.mapTruncated))
                mapRawData.cmdbMessage = {
                    message: gs.getMessage("Application service map truncated. The application service map contains more CIs that are not shown."),
                    autoDismiss: true
                };
            return mapRawData;
        } catch (error) {
            if (error && error.uiMessage)
                throw error; //pass-thru intentional throw

            this._throwError(gs.getMessage("Failed to fetch graph data for service {0}", requestJson.bsId));
        }
    },

    /**
     *
     *  Check is user has access to application service record.
     *  @param  {string}  bsId - Application service sys id.
     *  @param  {string}  userId - User id of user if not passed it takes current logged in user.
     *  @return {boolean} if user is restricted for service it will return true else false.
     **/
    isApplicationServiceReadingPermitted: function(bsId, userId) {
        if (!userId) {
            userId = gs.getUserID();
        }
        var gr = new GlideRecord("cmdb_ci_service_auto");
        if (gr.get(bsId)) {
            return applicationServiceAPI.isUserRestrictedForApplicationService(gr, userId);
        } else {
            this._throwError(gs.getMessage("Application service with id {0} does not exist", bsId));
        }

    },

    /**
     *
     *  get all services associated with configuration items.
     *  @param  {Array} ciList - Array of sys ids of configuration
     *  @return {JSON}  key - configuration item sys id.
     *                  value - array of application service sys ids of which configuration item is part of.
     **/
    getApplicationServicesAssociatedWithCi: function(ciList) {
        return this.applicationServiceAPI.getApplicationServicesAssociatedWithCi(ciList, true);
    },

    setBaseParametersForNodes: function(inputParams) {
        this.baseParametersForNodesDefault = inputParams;
    },

    setBaseParametersForEdges: function(inputParams) {
        this.baseParametersForEdgesDefault = inputParams;
    },

    _setHostEdgeType: function() {
        // get runs on relation display name for host connection type
        if (this.fetchHosts && !this.hostEdgeType) {
            var grCmdbRelType = new GlideRecord('cmdb_rel_type');
            grCmdbRelType.get('60bc4e22c0a8010e01f074cbe6bd73c3');
            this.hostEdgeType = grCmdbRelType.sys_name;
            this.hostEdgeId = '60bc4e22c0a8010e01f074cbe6bd73c3';
        }
    },

    _transformToCMDBMap: function(bsId, serviceMappingGraphJSON, baseParametersForNodes, level) {
        var nodeList = [],
            edgeList = [],
            hostMap = {};

        this._setHostEdgeType();
        this._buildNodesAndEdgesListFromDTO(serviceMappingGraphJSON, nodeList, edgeList, hostMap);
        var nodeMap = this._buildNodeMap(bsId, nodeList, edgeList);
        this.addPropertiesToNodeMap(nodeMap, bsId, baseParametersForNodes);
        nodeMap = this._bfsNodeMap(bsId, nodeMap, level);

        return {
            ciNodeInfo: nodeMap
        };
    },

    addPropertiesToNodeMap: function(nodeMap, bsId, baseParametersForNodes) {
        nodeIdList = Object.keys(nodeMap);
        var propertiesForNodes = this._retrieveNodeProperties(nodeIdList, baseParametersForNodes);
        if (!propertiesForNodes[bsId]) {
            this._throwError(gs.getMessage('Failed to get properties for service {0}', bsId));
        }

        this._addApplicationServiceCount(nodeMap);
        var classNameSet = {};

        // Remove stale connections
        for (var node in nodeMap) {
            var currentNode = nodeMap[node];
            var currentNodeProperties = propertiesForNodes[node];

            if (!currentNode.properties)
                currentNode.properties = currentNodeProperties;
            else {
                for (var key in currentNodeProperties)
                    currentNode.properties[key] = currentNodeProperties[key];
            }

            currentNode.Class = currentNode.Class ? currentNode.Class : this.ciAdditionalInfo[node].sys_class_name;

            if (!classNameSet[currentNodeProperties.Class]) {
                classNameSet[currentNodeProperties.Class] = true;
            }
        }

        //this._addLayerToNodeMap(nodeMap, classNameSet);

        return nodeMap;
    },

    // DTO JSON store the grouping nodes and edges in hierarchy structure
    // This method build one flat list with all the nodes and one flat list with all edges.
    _buildNodesAndEdgesListFromDTO: function(dtoJSON, nodeList, edgeList, hostMap) {
        if (dtoJSON.nodes) {
            // Add current nodes to result list and trigger the method to check child node and connection for current nodes.
            dtoJSON.nodes.forEach(function(node) {
                nodeList.push(node);

                if (this.fetchHosts && node.hostId) {
                    if (!hostMap[node.hostId]) {
                        hostMap[node.hostId] = true;
                        // build host json
                        var host = {
                            "id": node.hostId,
                            "originalId": node.hostId,
                            "stableId": node.hostStableId,
                            "name": node.hostName,
                            "type": "CI",
                        };
                        nodeList.push(host);
                    }

                    // build ci to host edge
                    var hostEdge = {
                        "targetId": node.hostId,
                        "targetStableId": node.hostStableId,
                        "targetName": node.hostName,
                        "sourceId": node.id,
                        "sourceStableId": node.stableId,
                        "sourceName": node.name,
                        "type": this.hostEdgeType,
                        "id": gs.generateGUID(),
                        "isHostConnection": true, // this is used while setting edge type in _addConnectionToNodeMap
                        "internal_id": this.hostEdgeId
                    };
                    edgeList.push(hostEdge);
                }

                this._buildNodesAndEdgesListFromDTO(node, nodeList, edgeList, hostMap);
            }.bind(this));
        }

        // Add connection to result list
        if (dtoJSON.edges) {
            dtoJSON.edges.forEach(function(edge) {
                edgeList.push(edge);
            });
        }
    },

    _addApplicationServiceCount: function(nodeMap) {
        var nodeIds = Object.keys(nodeMap);
        if (nodeIds.length > 0) {
            var countForCIs = this.getApplicationServicesAssociatedWithCi(nodeIds);
            for (var i = 0; i < nodeIds.length; i++) {
                nodeMap[nodeIds[i]].applicationServicesCount = (countForCIs[nodeIds[i]]) ? countForCIs[nodeIds[i]].length : 0;
            }
        }
    },

    // Create node map with all the properties according CMDB JSON
    _buildNodeMap: function(bsId, nodeList, edgesList) {
        try {
            var cmdbNodesMap = {},
                entryPointIds = [],
                connectedEndpointSet = {};

            nodeList.forEach(function(node) {
                if (!(node.type == "DISCOVERY_ERROR_ENDPOINT" && this.SKIP_ERROR_NODES == "true")) {
                    var cmdbNode = {};
                    cmdbNode.icon = this.iconMethod(node.ciType);
                    cmdbNode.stableId = node.stableId;

                    // Node has a parent -> node is part of a grouping. Update parent group members list.
                    // host node cannot be parent, if parent == hostid, skip it
                    if (node.parent && node.hostId != node.parent) {
                        cmdbNode.groupIds = [];
                        var parent = node.parent.split(this.CLUSTER_ID_SEPARATOR)[0];
                        cmdbNode.groupIds.push(parent);
                        this.parentToChild[parent].push(node.originalId);
                    }

                    // Node has child node => node is grouped node.
                    if (node.nodes && node.nodes.length > 0) {
                        cmdbNode.isGroup = true;
                        cmdbNode.groupType = node.groupType;
                        this.parentToChild[node.originalId] = [];
                    }

                    if (node.type === "CONNECTED_ENDPOINT") {
                        connectedEndpointSet[node.originalId] = node.helperId;
                        this._addCMDBNodeCommonData(cmdbNode, node.helperId, "cmdb_ci_service_discovered", node.name);
                        cmdbNodesMap[node.helperId] = cmdbNode;
                    } else {
                        this._addCMDBNodeCommonData(cmdbNode, node.originalId, node.ciTypeName, node.name);
                        cmdbNodesMap[node.originalId] = cmdbNode;
                    }

                    if (node.type === "ENTRYPOINT")
                        entryPointIds.push(node.originalId);
                }
            }.bind(this));

            var reverseEdgesMap = {};
            this._addConnectionToNodeMap(edgesList, cmdbNodesMap, connectedEndpointSet, reverseEdgesMap);
            this._addConnectionsToGroup(cmdbNodesMap, reverseEdgesMap, bsId, entryPointIds);
            this._addServiceNode(bsId, entryPointIds, cmdbNodesMap); // Add service node with the endpoints connection (should replace the endpoint layer in the map).
            return cmdbNodesMap;
        } catch (e) {
            this._throwError(gs.getMessage('Failed to build node map for {0} error: {1}', [bsId, e]));
        }
    },

    _addCMDBNodeCommonData: function(cmdbNode, id, className, name) {
        cmdbNode.Class = className;
        cmdbNode.Name = name;
        cmdbNode.applicationServicesCount = 0;
        cmdbNode.connections = [];
        return cmdbNode;
    },

    _addConnectionsToGroup: function(cmdbNodeMap, reverseEdgesMap, bsId, entryPointIds) {
        var parents = Object.keys(this.parentToChild);
        for (var i = 0; i < parents.length; i++) {
            for (var j = 0; j < this.parentToChild[parents[i]].length; j++) {
                var cmdbConnection = {};
                cmdbConnection.sourceId = parents[i];
                cmdbConnection.targetId = this.parentToChild[parents[i]][j];
                cmdbConnection.id = this._generateMD5Hex(parents[i] + "_" + cmdbNodeMap[parents[i]].groupType + "_" + this.parentToChild[parents[i]][j]);
                cmdbConnection._label = this._sanitizeGroupType(cmdbNodeMap[parents[i]].groupType);
                cmdbConnection.internal_id = cmdbNodeMap[parents[i]].groupType;
                cmdbConnection.isVirtualConnection = false;
                cmdbConnection.isReference = false;
                cmdbConnection.endpoints = [];
                if (reverseEdgesMap.hasOwnProperty(cmdbConnection.targetId)) {
                    var reverseEdges = reverseEdgesMap[cmdbConnection.targetId];
                    reverseEdges.forEach(function(reverseEdge) {
                        var connection = JSON.parse(JSON.stringify(cmdbConnection));
                        if (entryPointIds.indexOf(reverseEdge.sourceId) >= 0) {
                            connection.originalSourceId = bsId;
                        } else {
                            connection.originalSourceId = reverseEdge.sourceId;
                        }
                        connection.id = gs.generateGUID();
                        cmdbNodeMap[parents[i]].connections.push(connection);
                    });
                } else {
                    cmdbNodeMap[parents[i]].connections.push(cmdbConnection);
                }
            }
        }
    },

    _sanitizeGroupType: function(groupName) {
        var words = groupName.split("_");
        for (var i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }
        return words.join(" ");
    },

    _addConnectionToNodeMap: function(edgesList, cmdbNodesMap, connectedEndpointSet, reverseEdgesMap) {
        // Map the connections to the relevant parent node.
        edgesList.forEach(function(edge) {
            var cmdbConnection = {};
            cmdbConnection.epId = edge.epId;
            cmdbConnection.sourceId = connectedEndpointSet[edge.sourceId] ? connectedEndpointSet[edge.sourceId] : edge.sourceId;
            cmdbConnection.sourceId = cmdbConnection.sourceId.split(this.CLUSTER_ID_SEPARATOR)[0];
            cmdbConnection.targetId = connectedEndpointSet[edge.targetId] ? connectedEndpointSet[edge.targetId] : edge.targetId;
            cmdbConnection.targetId = cmdbConnection.targetId.split(this.CLUSTER_ID_SEPARATOR)[0];
            cmdbConnection.id = this._generateMD5Hex(cmdbConnection.sourceId + "_" + edge.epId + "_" + cmdbConnection.targetId);
            cmdbConnection.stableId = edge.sourceStableId + '-' + edge.epStableId + '-' + edge.targetStableId;
            cmdbConnection.originalId = edge.id;

            if (edge.isHostConnection) {
                cmdbConnection._label = edge.type + "";
                cmdbConnection.internal_id = edge.internal_id;
            } else {
                cmdbConnection._label = gs.getMessage("Connection");
                cmdbConnection.internal_id = "Connection";
            }

            cmdbConnection.isVirtualConnection = false;
            cmdbConnection.isReference = false;
            cmdbConnection.endpoints = [];
            cmdbConnection.isServiceMapping = true;
            cmdbConnection.isHostConnection = edge.isHostConnection;

            if (cmdbNodesMap.hasOwnProperty(cmdbConnection.targetId)) {
                // Add the connection to the parent node.
                if (edge.reverseHidden)
                    cmdbNodesMap[edge.targetId].connections.push(cmdbConnection);
                else if (connectedEndpointSet[edge.sourceId])
                    cmdbNodesMap[connectedEndpointSet[edge.sourceId]].connections.push(cmdbConnection);
                else if (cmdbNodesMap[edge.sourceId])
                    cmdbNodesMap[edge.sourceId].connections.push(cmdbConnection);
            }

            // for original Source Id in next step
            if (!reverseEdgesMap.hasOwnProperty(edge.targetId)) {
                reverseEdgesMap[edge.targetId] = [];
            }
            var reverseEdge = {
                sourceId: edge.sourceId
            };
            reverseEdgesMap[edge.targetId].push(reverseEdge);

        }.bind(this));
    },

    _addLayerToNodeMap: function(cmdbNodesMap, classNameSet) {
        // Query the class - layer values.
        var classLayer = this._getCmdbLayerData(classNameSet);

        // Update the node map with the layer value.
        Object.keys(cmdbNodesMap).forEach(function(node) {
            if (cmdbNodesMap[node].properties) {
                if (classLayer[cmdbNodesMap[node].properties.Class])
                    cmdbNodesMap[node].layer = classLayer[cmdbNodesMap[node].properties.sys_class_name.value];
                else {
                    // If specific class does not have a layer - check it parents.
                    // Get tables method return all ci class hierarchy in-order.
                    var tables = new GlideTableHierarchy(cmdbNodesMap[node].properties.sys_class_name.value).getTables();
                    for (var i = 0; i < tables.length; i++) {
                        if (classLayer[tables[i]]) {
                            cmdbNodesMap[node].layer = classLayer[tables[i]];
                            break;
                        }
                    }
                    // Add default layer value("Infrastructure') if not found parent - should not happen.
                    cmdbNodesMap[node].layer = cmdbNodesMap[node].layer ? cmdbNodesMap[node].layer : this.DEFAULT_NODE_LAYER;
                    // Save the result to prevent later parent check logic.
                    classLayer[cmdbNodesMap[node].properties.sys_class_name.value] = cmdbNodesMap[node].layer;
                }
            } else {
                this.log.error("Unable to get layer information for node " + node + " as properties does not exists");
            }
        });
    },

    _getCmdbLayerData: function(classNameSet) {
        var classNameHierarchySet = {};

        // Build unique class map(include hierarchy) for layer query.
        Object.keys(classNameSet).forEach(function(className) {
            if (!classNameHierarchySet[className]) {
                // Get tables method return all ci class hierarchy in-order.
                var tables = new GlideTableHierarchy(className).getTables();
                tables.forEach(function(table) {
                    classNameHierarchySet[table] = true;
                });
            }
        });

        // Convert to array.
        var ciClassList = Object.keys(classNameHierarchySet);
        var classLayer = {};

        // Query layers in batches and build class - layer map.
        for (var i = 0; i < ciClassList.length; i += this.MAX_CHUNK_SIZE) {
            var part = ciClassList.slice(i, i + this.MAX_CHUNK_SIZE);
            var grLayer = new GlideRecordSecure("cmdb_layer");
            grLayer.addQuery("class", part);
            grLayer.query();
            while (grLayer.next()) {
                // Build class to layer map with children classes.
                classLayer[grLayer.getValue("class")] = grLayer.getElement("layer").toString();
            }
        }

        return classLayer;
    },

    _addServiceNode: function(serviceId, entryPoints, cmdbNodesMap) {
        try {
            var serviceNode = {},
                properties = {};
            properties["Entry Points"] = [];
            if (!cmdbNodesMap.hasOwnProperty(serviceId)) {
                var serviceClassAndName = this._getCiClassAndName(serviceId);
                serviceNode.Class = serviceClassAndName.className;
                serviceNode.icon = this.iconMethod(serviceClassAndName.classLabel);
                serviceNode.Name = serviceClassAndName.name;
                serviceNode.applicationServicesCount = 0;
                serviceNode.connections = [];
            } else {
                serviceNode = cmdbNodesMap[serviceId];
            }
            entryPoints.forEach(function(entryPoint) {

                // Create a copy of the connection object array to change the source id value.
                var entryPointConnections = JSON.parse(JSON.stringify(cmdbNodesMap[entryPoint].connections));

                // adding entry points for discovered services.
                if (cmdbNodesMap[entryPoint].Class != "Manual Endpoint")
                    properties["Entry Points"].push(cmdbNodesMap[entryPoint]["Name"]);

                // Change the source id of the connection to the service node.
                entryPointConnections.forEach(function(connection) {
                    if (connection.targetId != serviceId) {
                        connection.sourceId = serviceId;
                        serviceNode.connections.push(connection);
                    }
                    // add entry points for manual endpoints.
                    if (cmdbNodesMap[entryPoint].Class == "Manual Endpoint") {
                        properties["Entry Points"].push(cmdbNodesMap[connection.targetId]["Name"]);
                    }
                });
            }.bind(this));
            serviceNode.properties = properties;
            cmdbNodesMap[serviceId] = serviceNode;
        } catch (error) {
            this._throwError(gs.getMessage('Failed to add service node due to error {0}', error));
        }
    },

    _getCiClassAndName: function(id) {
        var result = {};
        var gr = new GlideRecord("cmdb_ci");
        if (gr.get(id)) {
            result.className = gr.getDisplayValue("sys_class_name");
            result.name = gr.getDisplayValue("name");
            result.classLabel = gr.getValue("sys_class_name");
        }
        return result;
    },

    // Use BFS to build the CMDB graph JSON in the same way in every run.
    _bfsNodeMap: function(serviceNodeId, cmdbNodesMap, maxLevel) {
        var nodeCount = 0;
        var cmdbNodesMapWithLevels = {};

        // DEF0475715: the levels part of the BFS is deprecated since Xanadu release.
        // In Xanadu, the getMap SM API will resolve partial map truncated to the requested number of levels
        // We should not try truncating levels here.

        var glideWarVersion = gs.getProperty('glide.war', '');

        //not supporting below Vancouver for this codebase.
        var isPartialMapAPI = !glideWarVersion.startsWith('glide-vancouver') && !glideWarVersion.startsWith('glide-washingtondc');

        if (isPartialMapAPI)
            maxLevel = Number.POSITIVE_INFINITY;

        var currentLevelNodeIdQueue = [serviceNodeId];
        var nextLevelNodeIdQueue = [];
        var bfsLevel = 0;
        var nodeId;

        var validLifeCycleMap = this._getValidLifeCycles();

        var hostsNodeList = {};

        // BFS loop - loop end when there is no new nodes in current or next level.
        while (currentLevelNodeIdQueue.length > 0 || nextLevelNodeIdQueue.length > 0) {
            // Get next node from current layer or next layer. if not found - exit the loop.
            if (currentLevelNodeIdQueue.length > 0)
                nodeId = currentLevelNodeIdQueue.shift();
            else if (++bfsLevel <= maxLevel && nextLevelNodeIdQueue.length > 0) {
                currentLevelNodeIdQueue = nextLevelNodeIdQueue.slice();
                nextLevelNodeIdQueue = [];
                nodeId = currentLevelNodeIdQueue.shift();
            } else {
                break;
            }

            // Check we did not visit this node.
            if (cmdbNodesMapWithLevels[nodeId]) continue;

            // Get node life cycle - first from the node itself(value from service model) otherwise from properties
            var lifeCycle = cmdbNodesMap[nodeId].life_cycle_stage ? cmdbNodesMap[nodeId].life_cycle_status : this.ciAdditionalInfo[nodeId].life_cycle_stage;

            // If lifecycle is not valid(empty is valid) - skip node.
            if (lifeCycle && validLifeCycleMap && !validLifeCycleMap[lifeCycle]) continue;

            cmdbNodesMapWithLevels[nodeId] = cmdbNodesMap[nodeId];
            if (++nodeCount >= this.MAX_NODES) break;

            // Add the connection target to the bfs next layer.
            // Add the connections to the result.
            cmdbNodesMapWithLevels[nodeId].connections.forEach(function(connection) {
                if (connection.isHostConnection)
                    hostsNodeList[connection.targetId] = true;
                else if (connection.targetId === nodeId)
                    nextLevelNodeIdQueue.push(connection.sourceId);
                else
                    nextLevelNodeIdQueue.push(connection.targetId);
            });

            //Add child node to current bfs layer.
            if (this.parentToChild[nodeId])
                currentLevelNodeIdQueue = currentLevelNodeIdQueue.concat(this.parentToChild[nodeId]);

            // Add parent node to current bfs layer.
            if (cmdbNodesMap[nodeId].groupIds)
                currentLevelNodeIdQueue = currentLevelNodeIdQueue.concat(cmdbNodesMap[nodeId].groupIds);
        }

        this.mapTruncated = currentLevelNodeIdQueue.length > 0 || nextLevelNodeIdQueue.length > 0;

        var remainSize = this.MAX_NODES - Object.keys(cmdbNodesMapWithLevels).length;
        Object.keys(hostsNodeList).slice(0, remainSize).forEach(function(host) {
            cmdbNodesMapWithLevels[host] = cmdbNodesMap[host];
        });

        // Remove stale connections
        for (var node in cmdbNodesMapWithLevels) {
            cmdbNodesMapWithLevels[node].connections = cmdbNodesMapWithLevels[node].connections.filter(function(connection) {
                return cmdbNodesMapWithLevels[connection.sourceId] && cmdbNodesMapWithLevels[connection.targetId];
            }.bind(this));
        }

        return cmdbNodesMapWithLevels;
    },

    _retrieveNodeProperties: function(nodeList, baseParameters) {
        try {
            var basePropertiesForNodes = this._getCItoPropertiesMap(nodeList, baseParameters['cmdb_ci']);

            if (this.log.debugOn())
                this.log.debug("Successfully retrieved properties for nodes: " + JSON.stringify(basePropertiesForNodes));

            return basePropertiesForNodes;
        } catch (error) {
            this._throwError(gs.getMessage('Failed to retrieve base properties for nodes due to error {0}', error));
        }
    },

    _getCItoPropertiesMap: function(sysIds, parameters) {
        var ciToPropertiesMap = {};
        var classToCiMap = {};
        var ciAdditionalInfo = {};

        var propertiesNameToLabel = this.mapService.getCiAttributeMetadata();
        for (var i = 0; i < sysIds.length; i += this.MAX_CHUNK_SIZE) {
            var chunk = sysIds.slice(i, i + this.MAX_CHUNK_SIZE);
            var gr = new GlideRecord("cmdb_ci");
            gr.addQuery("sys_id", "IN", chunk);
            gr.query();
            while (gr.next()) {
                ciToPropertiesMap[gr.getUniqueValue()] = {};
                for (var k = 0; k < parameters.length; k++) {
                    if (propertiesNameToLabel.hasOwnProperty(parameters[k])) {
                        var internalId = this.propNeedsInternalId.indexOf(parameters[k]) != -1 ? gr.getValue(parameters[k]) : '';
                        if (this.propertiesForFieldValues.indexOf(parameters[k]) != -1) {
                            ciToPropertiesMap[gr.getUniqueValue()][parameters[k]] = this.mapBase._getPropWithLabelValue(propertiesNameToLabel[parameters[k]], gr.getValue(parameters[k]), internalId);
                        } else {
                            ciToPropertiesMap[gr.getUniqueValue()][parameters[k]] = this.mapBase._getPropWithLabelValue(propertiesNameToLabel[parameters[k]], gr.getDisplayValue(parameters[k]), internalId);
                        }
                    }
                }

                ciAdditionalInfo[gr.getUniqueValue()] = {
                    'life_cycle_stage': gr.getValue("life_cycle_stage"),
                    'sys_class_name': gr.getDisplayValue('sys_class_name')
                };
            }
        }

        this.ciAdditionalInfo = ciAdditionalInfo;
        return ciToPropertiesMap;
    },

    _getPropertiesLabels: function(className, properties) {
        var nameToLabel = {};
        var dictionary = new GlideRecord("sys_dictionary");
        dictionary.addQuery("name", className);
        dictionary.addQuery("element", "IN", properties);
        dictionary.query();
        while (dictionary.next()) {
            nameToLabel[dictionary.getValue("element")] = dictionary.getValue("column_label");
        }
        return nameToLabel;
    },

    // for the input class we fetch all the parent table names in hierarchy and try to fetch the properties from the input ui view.
    // if no properties found in the view than we fetch all direct properties for that class and then search for parent class in the view.
    // at the end we also add the default base properties that needs to be part of the properties as per invokers request.
    _getPropertiesFromView: function(viewName, className, baseParameters, addAdditionalProperties) {
        var tables = new GlideTableHierarchy(className).getTables();
        var properties = [];
        if (addAdditionalProperties) {
            properties = JSON.parse(sn_scoped_cache.ScopedCacheManager.get(this.SA_MAP_VIEW_PROPERTIES_CACHE, className));
            if (!properties) {
                properties = [];
                try {
                    var tableWithoutViews = [];
                    for (var k = 0; k < tables.length; k++) {
                        var gr = new GlideRecord("sys_ui_view");
                        gr.addQuery("name", viewName);
                        gr.query();
                        if (gr.next()) {
                            var grSection = new GlideRecord("sys_ui_section");
                            grSection.addQuery("name", tables[k]);
                            grSection.addQuery('view', gr.getUniqueValue());
                            grSection.query();
                            if (grSection.next()) {
                                var grElement = new GlideRecord("sys_ui_element");
                                grElement.addQuery("sys_ui_section", grSection.getUniqueValue());
                                grElement.addNullQuery("type");
                                grElement.orderBy("position");
                                grElement.query();
                                while (grElement.next()) {
                                    properties.push(grElement.getValue("element"));
                                }
                            }
                        }
                        if (properties.length > 0)
                            break;
                        tableWithoutViews.push(tables[k]);
                    }
                    if (tableWithoutViews.length > 0) {
                        for (var i = 0; i < tableWithoutViews.length; i++) {
                            var tableProperties = this.applicationServiceAPI.getUniqueClassElementDescriptors(tableWithoutViews[i]);
                            if (tableProperties.length > 0) {
                                properties = properties.concat(tableProperties);
                            }
                        }
                    }
                    sn_scoped_cache.ScopedCacheManager.put(this.SA_MAP_VIEW_PROPERTIES_CACHE, className, JSON.stringify(properties));
                } catch (error) {
                    this.log.error("Error fetching properties for " + className + " adding only default properties");
                }
            }
        }
        for (var l = 0; l < tables.length; l++) {
            if (baseParameters.hasOwnProperty(tables[l])) {
                properties.push.apply(properties, baseParameters[tables[l]]);
            }
        }
        return properties;
    },

    getEdgeProperties: function(inputJson, additionalProperties) {
        if (!this.checkIfItServicePluginExists()) {
            // Copy baseParametersForEdgesDefault.
            propertiesList = {};
            for (var key in this.baseParametersForEdgesDefault) {
                propertiesList[key] = this.baseParametersForEdgesDefault[key];
            }

            if (!propertiesList.hasOwnProperty('cmdb_ci_endpoint')) {
                propertiesList.cmdb_ci_endpoint = [];
            }

            var edgeIdList = inputJson.edges.map(function(edge) {
                return edge.epId;
            });

            // Add additional properties to default properties.
            propertiesList.cmdb_ci_endpoint = propertiesList.cmdb_ci_endpoint.concat(additionalProperties || []);
            return this._getEndpointProperties(edgeIdList, propertiesList);
        } else {
            var edgesMap = {};
            inputJson.edges.forEach(function(edge) {
                edgesMap[edge.originalId] = edge.stableId;
            });

            var timestamp = inputJson.timestamp ? inputJson.timestamp : null;
            var edgesPropertiesString = new sn_itservice.ScopedSmServiceMapApi().getEdgesProperties(inputJson.bsId, edgesMap, timestamp);
            var edgesPropertiesJson = JSON.parse(edgesPropertiesString);
            var edgesPropertiesOutput = {};

            var excludedKeys = ["Source Name", "Target Name"];
            edgesPropertiesJson.forEach(function(edge) {
                var formattedProperties = {};

                Object.keys(edge.attributes).filter(function(key) {
                    return edge.attributes[key].value !== undefined && excludedKeys.indexOf(key) === -1;
                }).forEach(function(key) {
                    formattedProperties[edge.attributes[key].label] = edge.attributes[key].value;
                });

                edgesPropertiesOutput[edge.id] = formattedProperties;
            });

            return edgesPropertiesOutput;
        }
    },

    checkIfItServicePluginExists: function() {
        try {
            snItServicePluginExists = sn_itservice.ScopedSmServiceMapApi ? true : false;
        } catch (error) {
            this.log.debug(error);
            return false;
        }
        return snItServicePluginExists;
    },

    /*
    ciMap is a map of ciId: stableId
    */
    getNodeProperties: function(ciMap, timestamp, bsId) {
        if (this.checkIfItServicePluginExists()) {
            return JSON.parse(new sn_itservice.ScopedSmServiceMapApi().getFullCiData(ciMap, timestamp, bsId));
        } else {
            this.log.debug('cmdb.it_service plugin is not updated');
            return null;
        }
    },

    _getEndpointProperties: function(edgeList, baseParameters) {
        var endpointToPropertiesMap = {};
        var classToCiMap = {};
        // Fetch endpoint classes.
        for (var i = 0; i < edgeList.length; i += this.MAX_CHUNK_SIZE) {
            var chunk = edgeList.slice(i, i + this.MAX_CHUNK_SIZE);
            var gr = new GlideRecord("cmdb_ci");
            gr.addQuery("sys_id", "IN", chunk);
            gr.query();
            while (gr.next()) {
                if (!classToCiMap.hasOwnProperty(gr.getValue("sys_class_name")))
                    classToCiMap[gr.getValue("sys_class_name")] = [];
                classToCiMap[gr.getValue("sys_class_name")].push(gr.getUniqueValue());
            }
        }
        var classes = Object.keys(classToCiMap);
        for (var j = 0; j < classes.length; j++) {
            // Get SM view customization properties for current endpoint class
            var propertiesForClass = this._getPropertiesFromView("sa_map_properties", classes[j], baseParameters, true);
            if (propertiesForClass.length > 0) {
                var propertiesNameToLabel = this._getPropertiesLabels(classes[j], propertiesForClass);
                // fetch properties
                for (var l = 0; l < classToCiMap[classes[j]].length; l += this.MAX_CHUNK_SIZE) {
                    var part = classToCiMap[classes[j]].slice(l, l + this.MAX_CHUNK_SIZE);
                    var grForClass = new GlideRecord(classes[j]);
                    grForClass.addQuery("sys_id", "IN", part);
                    grForClass.query();
                    while (grForClass.next()) {
                        endpointToPropertiesMap[grForClass.getUniqueValue()] = {};
                        for (var k = 0; k < propertiesForClass.length; k++) {
                            if (propertiesNameToLabel.hasOwnProperty(propertiesForClass[k])) {
                                endpointToPropertiesMap[grForClass.getUniqueValue()][propertiesNameToLabel[propertiesForClass[k]]] = grForClass.getDisplayValue(propertiesForClass[k]);
                            }
                        }
                    }
                }
            }
        }
        return endpointToPropertiesMap;
    },

    _getValidLifeCycles: function() {
        var lifeCycleStageInclusion;
        if (this.mapService.getLifeCycleStageInclusionList)
            lifeCycleStageInclusion = this.mapService.getLifeCycleStageInclusionList(this.mapBase.OPERATIONAL_LIFE_CYCLE_STAGE_MODE.VIEW);
        if (!lifeCycleStageInclusion) return null;
        var lifeCycleStageInclusionList = lifeCycleStageInclusion.split(",");
        var lifeCycleStageInclusionMap = {};

        lifeCycleStageInclusionList.forEach(function(lifeCycle) {
            lifeCycleStageInclusionMap[lifeCycle.trim()] = true;
        });

        return lifeCycleStageInclusionMap;
    },

    _generateMD5Hex: function(value) {
        return this.digest.getMD5Hex(value);
    },

    _throwError: function(err) {
        this.log.error("exception msg : = " + err);
        throw new sn_ws_err.BadRequestError(err);
    },
    
    type: 'ApplicationServiceGraphDTOTranslator'
}; 
