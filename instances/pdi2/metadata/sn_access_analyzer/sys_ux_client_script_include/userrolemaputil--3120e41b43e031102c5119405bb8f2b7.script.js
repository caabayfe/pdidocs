function include({ imports }, api, helpers) {

    // -------------------------------------------------------------------------------- //

    const NodeIcon = {
        User: "user-fill",
        Group: "user-group-fill",
        Role: "user-tag-fill"
    }

    // -------------------------------------------------------------------------------- //

    class Node {

        constructor(node) {
            Object.assign(this, node);
            this.children = [];
        }

        addChild(node) {
            if (!this.children.includes(node.id)) {
                this.children.push(node.id);
            }
        }

        getEdges() {
            let edges = this.children.map(childId => {
                return {
                    id: this.id + ':' + childId,
                    sourceId: this.id,
                    targetId: childId
                }
            });
            return edges;
        }

        getNodeData(conf) {
            conf = conf || {};
            var data = {
                id: this.id,
                nodeType: this.type,
                viewData: {
                    icon: NodeIcon[this.type],
                    primaryLabel: this.name,
                    secondaryLabel: this.type
                }
            };

            if (!isEmpty(this.status))
                data.viewData.status = this.status;

            if (!isEmpty(this.statusIcon))
                data.viewData.statusIcon = this.statusIcon;

            if (!isEmpty(this.tooltipContent))
                data.tooltipContent = this.tooltipContent;

            if (conf.leafNodeStatus) {
                data.viewData.status = this.children.length == 0 ? conf.leafNodeStatus : "none"
            }
            return data;
        }

    }

    // -------------------------------------------------------------------------------- //

    class RoleNode extends Node {
        constructor(node) {
            super(node);
            this.type = "Role";
        }
        getNodeData(conf) {
            let node = super.getNodeData(conf);
            if (this.children.length > 0) {
                node.isGroup = true;
                node.viewData.groupCount = this.children.length;
            }
            return node;
        }
    }

    // -------------------------------------------------------------------------------- //

    class GroupNode extends Node {

        constructor(node) {
            super(node);
            this.type = "Group";
        }

        getNodeData(conf) {
            let node = super.getNodeData(conf);
            node.isGroup = true;
            node.viewData.groupCount = this.children.length;
            return node;
        }
    }

    // -------------------------------------------------------------------------------- //

    class UserNode extends Node {
        constructor(node) {
            super(node);
            this.type = "User";
        }
    }

    // -------------------------------------------------------------------------------- //

    class NodeMap {

        _nodeMap;

        constructor() {
            this._nodeMap = new Map();
        }

        getRoleMap(user, nodes, conf) {
            this.conf = conf;
            this.createNode(user);
            this._createNodes(nodes);
            this._connectNodes(user.id, nodes);
            return this._generateRoleMap();
        }

        _createNodes(nodes) {
            nodes.forEach(node => {
                this.createNode(node);
                node.containingGroups.forEach(group => this.createNode(group));
            });
        }

        _connectNodes(userId, nodes) {
            nodes.forEach(node => {

                if (node.assignmentTypes.includes('DIRECT')) {
                    this.addChild(userId, node.id);
                }

                node.containedRoles.forEach(childNodeId => this.addChild(node.id, childNodeId));

                node.containingGroups.forEach(group => {
                    this.addChild(userId, group.id);
                    this.addChild(group.id, node.id);
                });
            });
        }

        _generateRoleMap() {
            var nodes = [];
            var edges = [];
            this._nodeMap.forEach(node => {
                nodes.push(node.getNodeData(this.conf));
                edges.push(...node.getEdges())
            });
            return {
                nodes: nodes,
                edges: edges
            };
        }

        addChild(parentId, childId) {
            this._nodeMap.get(parentId).addChild(this._nodeMap.get(childId));
        }

        getNode(id) {
            return this._nodeMap.get(id);
        }

        createNode(node) {
            if (this._nodeMap.has(node.id))
                return null;
            let n = null;
            let type = node.type || "";
            switch (type.toLowerCase()) {
                case "role":
                    n = new RoleNode(node);
                    break;
                case "group":
                    n = new GroupNode(node);
                    break;
                default:
                    n = new UserNode(node)
            }
            if (!n)
                return null;
            this._nodeMap.set(node.id, n);
            return node;
        }

    }

    // -------------------------------------------------------------------------------- //

    class ViewChangesNodeMap extends NodeMap {
        getRoleMap(user, nodes, conf) {
            let k = {
                ADDED: {
                    status: "positive",
                    icon: null
                },
                REMOVED: {
                    status: "critical",
                    icon: "close-fill"
                },
                UNCHANGED: {
                    status: "low",
                    icon: "exclamation-fill"
                }
            }
            let parsedNodes = nodes.map(obj => {
                let node = {
                    ...obj.accessEntity,
                    containingGroups: [],
                };
                let status = obj.simulatorChangeAction;
                if (status != "NONE") {
                    node.status = k[status].status;
                    node.statusIcon = k[status].icon;
                    let nodeTypeLabel = this._changeProperCase(node.type);
                    let tms = api.state.translatedMessage;
                    node.tooltipContent = node.name + "<br/> [" + tms[nodeTypeLabel] +  " " +  tms['being'] + " " + tms[status.toLowerCase()] + "]";
                }
                return node;
            });
            return super.getRoleMap(user, parsedNodes, conf);
        }

        _changeProperCase(type) {
            return type.charAt(0) + type.slice(1).toLowerCase();
        }
        
        getStats(nodes) {
        	let count = {
                NONE: 0,
                ADDED: 0,
                REMOVED: 0,
                UNCHANGED: 0
            };
            nodes.forEach(node => count[node.simulatorChangeAction]++);
            return count;
        }

        selectNode(nodeId, align = false, statVar = "mapData") {
             let obj = {
                 selectedNodeId: [nodeId],
             };
             if (align)
                 obj.alignNodeId = nodeId;
             api.setState(statVar, ctx => ({
                ...ctx.currentValue,
                ...obj
             }));
         }

    }


    // -------------------------------------------------------------------------------- //

    const generateRoleMapData = (user, nodes, conf) => {
        return new NodeMap().getRoleMap(user, nodes, conf);
    }

    // -------------------------------------------------------------------------------- //

    const updateMap = (userObj, data, props) => {

        const { EmptyState } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);

        var conf = Object.assign({
            leafNodeStatus: "positive"
        }, props);

        var mapData;
        const emptyState = api.state[userObj.type + "EmptyState"];
        if(data && data.errorCode) {
            switch(data.errorCode) {
                case "ROLE_COUNT_EXCEEDED":
                    mapData = { nodes: [], edges: [] };
                    emptyState.show = true;
                    userObj.showLegend = false;
                    var err = {
                        heading: emptyState.messages.overload.heading,
                        content: emptyState.messages.overload.content,
                        actions: [{
                            name: "open_link",
                            variant: "secondary",
                            icon: "open-link-right-outline",
                            tableName: "sys_user",
                            id: userObj.id,
                            label: userObj.name
                        }]
                    }
                    EmptyState.show(err, userObj.type + "EmptyState");
            }
        } else if (data == null || data.length == 0) {
            mapData = { nodes: [], edges: [] };

            emptyState.show = true;
            userObj.showLegend = false;
            var err = {
                heading: emptyState.messages.noRoles.heading,
                content: emptyState.messages.noRoles.content
            }
            EmptyState.show(err, userObj.type + "EmptyState");

        } else {
            userObj.showLegend = true;
            emptyState.show = false;
            mapData = generateRoleMapData({
                id: userObj.id,
                name: userObj.name
            }, data, conf);
        }
        userObj.loadingState = false;
        api.setState(userObj.type, userObj);
        var tms = api.state.translatedMessages;
        mapData.nodes.forEach(node => node.viewData.secondaryLabel = tms[node.viewData.secondaryLabel]);
        api.setState(userObj.type + "Map", mapData);
    }

    // -------------------------------------------------------------------------------- //
    function showServerError() {
        const { EmptyState } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
        var baseUser = api.state.baseUser;
        var modelUser = api.state.modelUser;

        baseUser.showLegend = false;
        baseUser.loadingState = false;

        modelUser.showLegend = false;
        modelUser.loadingState = false;

        api.setState("baseUser", baseUser);
        api.setState("modelUser", modelUser);
        EmptyState.showServerErrorMessage("baseUserEmptyState");
        EmptyState.showServerErrorMessage("modelUserEmptyState");
    }

    const isEmpty = (val) => val == undefined || val == null || val.trim().length == 0;

    return {
        generateRoleMapData,
        ViewChangesNodeMap,
        updateMap,
        showServerError
    }

}
