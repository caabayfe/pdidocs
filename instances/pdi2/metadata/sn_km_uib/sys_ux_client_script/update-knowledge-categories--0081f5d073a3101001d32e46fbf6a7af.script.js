function handler({
    api,
    event,
    imports
}) {
    const getStringPath = (path, tree) => {
        let actualPath = 'items';
        let tempTree = tree;

        for (let i = 0; i < path.length; i++) {
            let index = tempTree.findIndex(y => y.id == path[i]);
            tempTree = tempTree[index].children;
            if (index != -1)
                actualPath += `[${index}].children`;
        }

        return actualPath;
    };

    /**
     * Alternative method to lodash _.set()
     */
    const put = function(obj, path, val) {
        var stringToPath = function(path) {
            if (typeof path !== 'string') return path;
            var output = [];

            path.split('.').forEach(function(item, index) {
                item.split(/\[([^}]+)\]/g).forEach(function(key) {
                    if (key.length > 0) {
                        output.push(key);
                    }
                });
            });

            return output;
        };

        path = stringToPath(path);

        var length = path.length;
        var current = obj;

        path.forEach(function(key, index) {
            var isArray = key.slice(-2) === '[]';
            key = isArray ? key.slice(0, -2) : key;

            if (isArray && Object.prototype.toString.call(current[key]) !== '[object Array]') {
                current[key] = [];
            }

            if (index === length - 1) {
                if (isArray) {
                    current[key].push(val);
                } else {
                    current[key] = val;
                }
            } else {
                if (!current[key]) {
                    current[key] = {};
                }

                current = current[key];
            }
        });
    };

    /**
     * Alternative method to lodash _.has()
     */
    const has = function(object, property) {
        return object != null && object.hasOwnProperty(property);
    };

    const buildTree = (categories) => {
        var catTree = {};
        try {
            categories.forEach((x) => {
                if (has(catTree, x.id)) {
                    catTree[x.id].label = x.label;
                    catTree[x.id].id = x.id;
                    catTree[x.id].path.unshift(x.parentId);
                } else {
                    catTree[x.id] = {
                        id: x.id,
                        label: x.label,
                        children: [],
                        path: [x.parentId]
                    };
                    if (catTree[x.parentId] && catTree[x.parentId].path) {
                        catTree[x.id].path.unshift(...catTree[x.parentId].path);
                    }
                }

                if (has(catTree, x.parentId)) {
                    catTree[x.parentId].children.push(catTree[x.id]);
                } else {
                    catTree[x.parentId] = {
                        children: [catTree[x.id]]
                    };
                }
            });
            return catTree;
        } catch (e) {
            return {};
        }
    };

    const getExpandedPath = (path) => {
        let tempPath = [];
        path.forEach((element, i) => {
            if (i == 0)
                tempPath.push([element]);
            else
                tempPath.push([...tempPath[i - 1], element]);
        });
        return tempPath;
    };

    if (event.elementId == 'get_knowledge_categories_initial' || event.elementId == 'get_knowledge_categories_encoded_record') {
        if (event.name == 'DATA_FETCH_SUCCEEDED') {
            if (api.state.items.length <= 0) {
                let categories = null;

                if (api.data.get_knowledge_categories_initial.output.data) {
                    categories = api.data.get_knowledge_categories_initial.output.data.AppKnowledge_Query.first;
                } else {
                    categories = api.data.get_knowledge_categories_encoded_record.output.data.AppKnowledge_Query.first;
                }

                if (categories.length <= 0) {
                    api.setState('hideNoItemsMessage', false);
                }

                if (categories && categories.length > 0) {
                    api.setState('items', categories);

                    if (api.state.value) {
                        let flatCategories = null;

                        if (api.data.get_knowledge_categories_initial.output.data) {
                            flatCategories = api.data.get_knowledge_categories_initial.output.data.AppKnowledge_Query.second;
                        } else {
                            flatCategories = api.data.get_knowledge_categories_encoded_record.output.data.AppKnowledge_Query.second;
                        }

                        if (flatCategories && flatCategories.length > 0) {
                            let categoryTree = buildTree(flatCategories);

                            if (categoryTree[api.state.value]) {
                                let path = categoryTree[api.state.value].path;

                                if (path.length > 0) {
                                    path.shift();
                                    let index = categories.findIndex((y) => y.id == path[0]);

                                    if (index != -1) {
                                        categories[index].children = categoryTree[path[0]].children;
                                        api.setState('items', categories);
                                    }

                                    let expandedItems = getExpandedPath(path);
                                    path.push(api.state.value);

                                    if (expandedItems.length > 0) {
                                        api.setState('expandedItems', expandedItems);
                                    }

                                    api.setState('selectedItems', [path]);
                                }
                            }
                        } else {
                            let index = categories.findIndex(y => y.id == api.state.value);

                            if (index != -1) {
                                api.setState('selectedItems', [[api.state.value]]);
                            }
                        }
                    }
                }
            }
        }
    }

    if (event.elementId == 'get_knowledge_categories_expand') {
        if (event.name == 'DATA_FETCH_SUCCEEDED') {
            var path = getStringPath(api.state.route, api.state.items);
            var items = {
                'items': api.state.items
            };

            put(items, path, api.data.get_knowledge_categories_expand.output.data.AppKnowledge_Query.first);

            api.setState('items', items.items);
            api.setState('loadingItems', []);
        }
    }
}
