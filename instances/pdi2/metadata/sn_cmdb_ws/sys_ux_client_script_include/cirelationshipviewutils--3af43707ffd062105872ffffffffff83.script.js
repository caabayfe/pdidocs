function relationshipViewUtils(proxyArg, params) {
    const { api, event, helpers, imports } = params;

    const CONSTANTS = {
        STREAM_TYPE_UP: 'up',
        STREAM_TYPE_DOWN: 'down',
        LOAD_TYPE_FLAT: 'flat',
        LOAD_TYPE_TREE: 'tree'
    };

    const _setEmptyState = async (isEmpty, hasFilter) => {
        if (!isEmpty) {
            api.setState('emptyStateConfig', ({currentValue}) => {
                return {
                    ...currentValue,
                    hidden: true
                };
            });
            return;
        }
        const EMPTY_STATES = {
            NO_RELATIONSHIPS: {
                illustration: 'no-data',
                heading: {
                    label: await helpers.translate('This CI has no relationships'),
                    level: 3
                }
            },
            NO_FILTER_RESULTS: {
                illustration: 'no-search-results',
                heading: {
                    label: await helpers.translate('There are no items matching your search criteria'),
                    level: 3
                }
            }
        }

        api.setState('emptyStateConfig', ({currentValue}) => {
            return {
                ...currentValue,
                hidden: false,
                ...(hasFilter ? EMPTY_STATES.NO_FILTER_RESULTS : EMPTY_STATES.NO_RELATIONSHIPS)
            };
        });
    };

    const _getParentString = (rel) => {
        if (rel.level > 1)
            return `[${_getParentNames(rel.parents)} \u21E2 ]`;
        return '';
    };

    const _getParentNames = (parentArr) => {
        let parentNames = [];
        parentArr.forEach((parent) => {
            parentNames.push(parent.name);
        });

        return parentNames.sort().join(', ');
    };

    const getIcon = (ciSysClass) => {
        const {
            classToIconMap,
        } = api.data.cmdb_relation_get_relationship_data.result;
        if (ciSysClass == 'sys_user')
            return 'user-outline';
        if (ciSysClass == 'sys_user_group')
            return 'user-group-outline';
        if (classToIconMap[ciSysClass] && classToIconMap[ciSysClass].icon)
            return classToIconMap[ciSysClass].icon;

        return 'configuration-item-outline';
    };

    const _getTreeNodes = (relations, visited = new Set(), streamType) => {
        const { ciToRelCache } = api.state;
        let nodes = [];
        let filteredRelations = relations.filter((relation) => relation.streamType == streamType);
        filteredRelations.forEach((relation) => {
            let {
                ciSysClass,
                relationTypeDesc,
                relationTypeSysId
            } = relation;

            relation.relations.forEach((rel) => {
                // Prevent circular references by checking if the node has already been visited
                if (visited.has(rel.childSysId)) {
                    return; // Skip this node
                }

                // Mark the node as visited
                visited.add(rel.childSysId);
                if (rel.level == 1) {
                    let node = {};
                    node.id = `${relationTypeSysId}-${rel.childSysId}`;
                    node.childName = rel.childName;
                    node.label = `[${relationTypeDesc}] ${rel.childName}`;
                    node.table = ciSysClass;
                    node.sysId = rel.childSysId;
                    node.actionable = true;
                    node.identifierProps = {
                        type: 'icon',
                        icon: getIcon(ciSysClass)
                    };

                    let children = [];
                    if (ciToRelCache && ciToRelCache[rel.childSysId]) {
                        // Pass the visited set to the recursive call
                        children = _getTreeNodes(ciToRelCache[rel.childSysId], visited, streamType);
                    } else if (rel.childrenCount > 0) {
                        children.push({
                            variant: "placeholder"
                        });
                    }

                    node.children = children;
                    nodes.push(node);
                }

                // Remove the node from the visited set after processing (optional)
                visited.delete(rel.childSysId);
            });
        });
        return nodes.sort((a, b) => a.childName.localeCompare(b.childName));
    };

    const handleTreeLoadType = async () => {
        const {
            ciSysId
        } = api.context.props;
        const {
            ciDisplayName,
            ciToRelCache,
            rootIcon,
            treeContents
        } = api.state;
        const {
            ci,
            classToIconMap,
            relationships: {
                relations
            }
        } = api.data.cmdb_relation_get_relationship_data.result;

        if (!ciDisplayName)
            api.setState('ciDisplayName', ci.displayValue);
        ciToRelCache[ci.sysId] = relations;

        let baseIcon = rootIcon || getIcon(ci.ciClassName);    
        if (!rootIcon)
            api.setState('rootIcon', baseIcon);
        let upTree = [], downTree = [];
        let upExpanded = treeContents.up.expandedItems || [], downExpanded = treeContents.down.expandedItems || [];
        
        let root = {
            id: ciSysId,
            label: ciDisplayName || ci.displayValue,
            identifierProps: {
                type: 'icon',
                icon: baseIcon
            }
        };
        let upTreeRoot = {
            ...root
        };
        let downTreeRoot = {
            ...root
        };
        upTreeRoot.children = _getTreeNodes(ciToRelCache[ciSysId], new Set(), CONSTANTS.STREAM_TYPE_UP);
        downTreeRoot.children = _getTreeNodes(ciToRelCache[ciSysId], new Set(), CONSTANTS.STREAM_TYPE_DOWN);
        if (upTreeRoot.children.length > 0)
            upTree.push(upTreeRoot);
        if (downTreeRoot.children.length > 0)
            downTree.push(downTreeRoot);
        if (!treeContents.up.expandedItems)
            upExpanded.push([upTreeRoot.id]);
        if (!treeContents.down.expandedItems)
            downExpanded.push([downTreeRoot.id]);

        api.setState('treeContents', ({
            currentValue
        }) => {
            return {
                ...currentValue,
                up: {
                    items: upTree,
                    expandedItems: upExpanded
                },
                down: {
                    items: downTree,
                    expandedItems: downExpanded
                }
            };
        });
        api.setState('ciToRelCache', ciToRelCache);
        await _setEmptyState(upTree.length == 0 && downTree.length == 0, false);
    }

    const handleFlatLoadType = async (filter) => {
        const {
            classToIconMap,
            relationships: {
                relations
            }
        } = api.data.cmdb_relation_get_relationship_data.result;
        let flatItems = [], flatExpanded = [];
        relations.forEach((relation) => {
            const {
                ciClassDisplayName,
                ciSysClass,
                relationTypeDesc,
                relationTypeSysId
            } = relation;
            let category = {
                id: `${relationTypeSysId}-${ciSysClass}`,
                label: `${relationTypeDesc} - ${ciClassDisplayName}`,
                identifierProps: {
                    type: 'icon',
                    icon: getIcon(ciSysClass)
                },
                children: []
            };
            flatExpanded.push([category.id]);
            relation.relations.forEach((rel) => {
                const {
                    childName,
                    childSysId,
                    level
                } = rel;
                if (!filter || childName.toLowerCase().includes(filter.toLowerCase())) {
                    let node = {
                        id: childSysId,
                        label: `[L${level}] ${_getParentString(rel)} ${childName}`,
                        children: [],
                        actionable: true,
                        table: ciSysClass,
                        sysId: childSysId
                    };
                    category.children.push(node);
                }
            });
            category.children.sort((a, b) => {
                return a.label.localeCompare(b.label);
            });
            if (category.children.length > 0)
                flatItems.push(category);
            flatItems.sort((a, b) => {
                return a.label.localeCompare(b.label);
            });
        });

        api.setState('treeContents', ({
            currentValue
        }) => {
            return {
                ...currentValue,
                flat: {
                    items: flatItems,
                    expandedItems: flatExpanded
                }
            };
        });
        await _setEmptyState(flatItems.length == 0, !!filter);
    }

    return {
       CONSTANTS,
       getIcon,
       handleFlatLoadType,
       handleTreeLoadType
    };
}
