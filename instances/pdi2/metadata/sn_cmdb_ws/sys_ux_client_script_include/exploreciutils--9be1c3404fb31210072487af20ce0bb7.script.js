/**
 * @param {params} params
 * @param {*} proxyArg 
 * @param {{api: params["api"], event: params["event"], helpers: params["helpers"], imports: params["imports"]}} params 
 * @returns 
 */
function exploreCiUtils(proxyArg, params) {
    const { api, event, helpers, imports } = params;

    const _LABEL_VALUE_TYPE = {
        TEXT_LINK: 'text-link',
        HIGHLIGHTED_VALUE: 'highlighted-value',
        STRING: 'string'
    }

    const NAVIGATION_ITEM_KEY = {
        SUMMARY: 'summary',
        ATTRIBUTES: 'attributes',
        TAGS: 'tags',
        RESOURCES: 'resources',
        ACTIVITY: 'activity',
        RELATIONSHIPS: 'relationships',
        SERVICE_AND_OFFERING: 'service_and_offering',
        HEALTH: 'health',
        CMDB360: 'cmdb_360'
    }

    const IMPORTANT_ATTRIBUTES_SECTION_LABEL = "Important attributes";
    const RELATED_ITEMS_USER_PREFERENCE = "sn_cmdb_ws.ciform.related_items";
    const SAVED_HIGHLIGHTED_VALUE_ID = "saved_highlighted_value";

    const DATA_RESOURCES = {
        get_service_and_offering: 'get_service_and_offering',
        get_related_items: 'get_related_items',
        multisource_data_preview: 'multisource_data_preview',
        get_cmdb_health_scores_for_ci: 'get_cmdb_health_scores_for_ci'
    }

    function initDataFetchState() {
        api.setState('dataResources', DATA_RESOURCES);
        const dataFetchState = Object.keys(DATA_RESOURCES).reduce((acc, key) => {
            acc[key] = {
                loading: false,
                fetchedOnce: false,
                error: false
            };
            return acc;
        }, {});
        api.setState('dataFetchState', dataFetchState);
    }

    function updateDataFetchState(resourceId, loading, error) {
        api.setState('dataFetchState', ({ currentValue }) => {
            return {
                ...currentValue,
                [resourceId]: {
                    loading,
                    fetchedOnce: (currentValue[resourceId] || {}).fetchedOnce || loading,
                    error
                }
            }
        });
    };

    function setNavItems(navItems) {
        api.setState('navItems', navItems);
    }

    function setNavChildItems(parentKey, children) {
        api.setState('navItems', ({ currentValue }) => {
            let _navItems = [];
            if (currentValue) {
                _navItems = JSON.parse(JSON.stringify(currentValue));
            }
            if (parentKey) {
                const _navItem = _navItems.find(item => item.id === parentKey);
                if (_navItem) {
                    _navItem.children = children;
                }
            }
            return _navItems;
        });
    }

    function findNavItemByPath(navItems, itemPath) {
        let currentItems = navItems;
        let foundItem = null;

        for (const id of itemPath) {
            foundItem = currentItems.find(item => item.id === id);
            if (!foundItem) {
                return null; // Item not found
            }
            currentItems = foundItem.children || [];
        }

        return foundItem;
    };

    function transformResources(relatedLists) {
        return relatedLists.map(r => ({
            ...r,
            id: r.value,
            label: r.displayLabel || r.label,
            table: r.targetTable,
            parentTable: r.sourceTable,
            parentRecordSysId: api.context.props.sysId,
            fixedQuery: r.filter,
        }));
    };

    function setResources(relatedLists) {
        const _resources = transformResources(relatedLists);
        api.setState('resources', _resources);
        setNavChildItems(NAVIGATION_ITEM_KEY.RESOURCES, _resources);
    }

    function transformAttributes(attributeSections = []) {
        return attributeSections.map(section => ({
            id: section.sysId,
            label: section.captionDisplay
		}));
    }

    function setAttributes(sections = []) {
        //first section is always summary
        if (!sections || sections.length <= 1)
            return;

        //filter out important attributes section and add everything else under Attributes nav item
        const _attributeSections = getAttributeSections(sections);
        const _attrChildNavItems = transformAttributes(_attributeSections);

        api.setState('attributes', _attrChildNavItems);
        setNavChildItems(NAVIGATION_ITEM_KEY.ATTRIBUTES, _attrChildNavItems);
    }

    function getAttributeSections(sections = []) {
        //first section is always summary
        if (!sections || sections.length <= 1)
            return;

        const [summarySection, ...remainingSections] = sections;
        return remainingSections?.filter(section => section?.caption != IMPORTANT_ATTRIBUTES_SECTION_LABEL);
    }

    function excludeUnauthorizedFields(fields = {}, section = {}) {
        const rows = section?.rows;
        if(!rows || rows.length==0)
            return section;

        let totalNumOfFields = 0;
        let numOfUnauthorizedFields = 0;

        const newRows = rows.map(row =>
            row.map(column => {
                const filteredFields = column.fields?.filter(field => {
                    const canRead = fields[field]?.canRead;
                    totalNumOfFields++;
                    if (!canRead)
                        numOfUnauthorizedFields++;

                    return canRead;
                });
                return {
                    fields: filteredFields
                };
            })
        );

        return {
            ...section,
            rows: newRows,
            totalNumOfFields,
            numOfUnauthorizedFields
        };
    };

    /**
     * Formats field object into <now-label-value-stacked> format
     * @param { Object } field, Object containing attributes for a field
     * @returns { Object } Object containing properties for <now-label-value-stacked> component
     */
    function formatLabelValue(field) {
        if (!field) return;
        const typeMapping = { reference: _LABEL_VALUE_TYPE.TEXT_LINK };
        let value = {};

        // Default to string type if value or type does not exist
        value.type = field.displayValue ? typeMapping[field.type] || _LABEL_VALUE_TYPE.STRING : _LABEL_VALUE_TYPE.STRING;
        value.type = field.colorName && field.displayValue ? _LABEL_VALUE_TYPE.HIGHLIGHTED_VALUE : value.type;

        switch (value.type) {
            case _LABEL_VALUE_TYPE.TEXT_LINK:
                value.label = field.displayValue;
                // Handle links navigation with link to destination event using metadata
                value.href = 'javascript:void(0)';
                value.metadata = { table: field.reference, sysId: field.value };
                break;
            case _LABEL_VALUE_TYPE.HIGHLIGHTED_VALUE:
                value.label = field.displayValue;
                value.color = field.colorName;
                value.variant = field.variantName;
                value.showIcon = field.showIcon;
                value.icon = field.iconName;
                break;
            default:
                value.value = field.displayValue || '--';
                break;
        }
        return {
            label: field.label || field.name,
            value: value
        }
    }

    /**
     * Formats fields array into columns with a specified number of columns
     * @param { Array } fields
     * @param { Integer } numOfColumns
     * @returns 2D array with inner array representing a column
     */
    function formatIntoColumns(fields, numOfColumns = 4) {
        // Creates an array with size numOfColumns and returns an array for each index
        const columns = Array.from({ length: numOfColumns }, () => []);
        fields.forEach((field, index) => {
            // Fill return object column wise 
            const columnIndex = index % numOfColumns;
            columns[columnIndex].push(field);
        });
        return columns;
    }

    async function getEmptyStateForSection(section = {}) {
        const PERMISSION_REQUIRED_LABEL = await helpers.translate("Permission required");
        const PERMISSION_REQUIRED_CONTENT = await helpers.translate("There is data that requires permission to view. Contact your administrator to grant permission.");

        const UNCONFIGURED_LABEL = await helpers.translate("This section has not been configured");
        const UNCONFIGURED_CONTENT = await helpers.translate("Contact your administrator to configure this section.");

        const EMPTY_STATES = {
            PERMISSIONS_REQUIRED: {
                ILLUSTRATION: 'permissions',
                HEADING: {
                    label: PERMISSION_REQUIRED_LABEL,
                    level: 3
                },
                CONTENT: PERMISSION_REQUIRED_CONTENT
            },
            UNCONFIGURED_SECTION: {
                ILLUSTRATION: 'unconfigured',
                HEADING: {
                    label: UNCONFIGURED_LABEL,
                    level: 3
                },
                CONTENT: UNCONFIGURED_CONTENT
            },
        };

        if(section?.rows?.length==0 || section?.totalNumOfFields==0)
            return EMPTY_STATES.UNCONFIGURED_SECTION;
        
        if(section?.totalNumOfFields==section?.numOfUnauthorizedFields)
            return EMPTY_STATES.PERMISSIONS_REQUIRED;

        return null;
    }

    function handleReferenceLinkClick(event) {
        let table, sysId;
        const { name } = event;
        if (name == "NOW_LABEL_VALUE_STACKED#TEXT_LINK_CLICKED" || name == "ATTRIBUTES_SECTION#REFERENCE_LINK_CLICKED") {
            ({ table, sysId } = event.payload.item.metadata);
        } else {
            ({ table, sys_id: sysId } = event.payload);
        }
        api.setState('routeResolverObj', { table, sysId });
    }

    function setLoadingState(loading) {
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading
        });
    }
    
    function closeEditMode() {
        const {
            section : {
                sysId,
                captionDisplay
            }
        } = api.context.props;

        api.setState('editMode', false);
        api.setState('formData', {});
        api.setState('isDirty', false);
        api.setState('maskedAttributes', []);
        api.emit('EXPLORE_CI_FORM_CONTROLLER#FORM_STATUS_CHANGED', {
            isDirty: false,
            sectionId: sysId,
            sectionName: captionDisplay
        });
        setFieldsMetadata([]);
    }

    function setFieldsMetadata(maskedAttributes = [], restoreSavedHighlightedValue = false) {
        const { fields, section } = api.context.props;
        const fieldsMetadata = _extractFieldsMetadata(fields, section);
        api.setState('fieldsMetadata', ({ currentValue }) => {
            // Retain metadata for masked attributes to preserve their state
            const retainedMaskedAttributesMetadata = _extractMaskedAttributesMetadata(currentValue, maskedAttributes);

            // Build new metadata for fields based on the current state and restore saved highlighted values if needed
            const updatedFieldsMetadata = _buildNewFieldsMetadata(fieldsMetadata, currentValue, restoreSavedHighlightedValue);

            // Merge the updated metadata with the retained masked attributes metadata
            return {
                ...updatedFieldsMetadata,
                ...retainedMaskedAttributesMetadata
            };
        });
    }

    function _extractFieldsMetadata(fields, section) {
        const fieldsMetadata = {};
        section?.rows?.flatMap(row => row?.flatMap(column => column.fields))
            .forEach(field => {
                fieldsMetadata[field] = fields[field];
            });
        return fieldsMetadata;
    }

    function _extractMaskedAttributesMetadata(currentValue, maskedAttributes) {
        return Object.fromEntries(
            Object.entries(currentValue).filter(([field]) => maskedAttributes.includes(field))
        );
    }

    function _buildNewFieldsMetadata(fieldsMetadata, currentValue, restoreSavedHighlightedValue) {
        const newFieldsMetadata = {};
        for (let field in fieldsMetadata) {
            const { highlightedValue, ...rest } = fieldsMetadata[field];
            newFieldsMetadata[field] = { ...rest };
            const { highlightedValue: currentHighlightedValue } = currentValue[field] || {};
            if (restoreSavedHighlightedValue && currentHighlightedValue?.id === SAVED_HIGHLIGHTED_VALUE_ID) {
                newFieldsMetadata[field].highlightedValue = {
                    ...currentHighlightedValue
                };
            }
        }
        return newFieldsMetadata;
    }

    function isEmpty(value) {
        return value === '' || value === null || value === undefined;
    }
    
    function isEmptyObj(obj) {
        return !obj || !Object.keys(obj).length;
    }

    function buildWarningNotificationItems({header, content, id}) {
        return buildNotificationItems('warning', header, content, id, 'triangle-exclamation-outline');
    }

    function buildSuccessNotificationItems({header, content, id}) {
        return buildNotificationItems('positive', header, content, id, 'circle-check-outline');
    }

    function buildErrorNotificationItems({header, content, id}) {
        return buildNotificationItems('critical', header, content, id, 'circle-close-outline');
    }

    function buildNotificationItems(status, header, content, id, icon) {
        return [{
            id,
            status,
            icon,
            content,
            header,
            action: {
                type: 'dismiss'
            }
        }];
    }

    function getSelectedItemsIds(selectedRelatedItems) {
        return selectedRelatedItems.map((srm) => {
            return srm[0]["id"];
        })
    }

    function getAvailableItems(result) {
        var availableRelatedItems = {};
        result.forEach((rm) => {
            const { name, sysId } = rm;
            availableRelatedItems[sysId] = { label: name };
        });
        return { Related_Items : availableRelatedItems };
    }

    function getSelectedItems(relatedItems, userPreferenceSelectedIds) {
        if (Array.isArray(userPreferenceSelectedIds)) {
            const preferedRelatedtems = relatedItems.filter((rm) => {
                return userPreferenceSelectedIds.indexOf(rm["sysId"]) > -1;
            });
            return getSelectedItemsArray(preferedRelatedtems);
        }
        return getSelectedItemsArray(relatedItems);
    }

    function getSelectedItemsArray(relatedItems) {
        const selectedRelatedItems = []
        relatedItems.map((rm) => {
            let selectedItem = [{ "id": rm["sysId"], "label": rm["name"] }];
            selectedRelatedItems.push(selectedItem);
        });
        return selectedRelatedItems;
    }

    async function getRelatedItems(result, userPreferenceRelatedItems) {
        const dataSourceLabel = await helpers.translate("Total");
       if (Array.isArray(userPreferenceRelatedItems)) {
          result = result.filter((rm) => {
                 return userPreferenceRelatedItems.indexOf(rm["sysId"]) > -1;
          });
         }
         return result.map((relItem) => {
            const {
                name,
                sysId,
                tableName,
                tableLabel,
                groupByField,
                groupByFieldLabel,
                groupByFieldType,
                fields,
                view,
                data,
                encodedQuery,
                 url
            } = relItem;
    
            const chartData = data.map((d) => {
                const {
                    label,
                    value,
                    query
                } = d;
                return {
                    [groupByField]: label,
                    value
                }
            });
            const elements = data.map((d) => {
                const {
                    label,
                    value,
                    query,
                    name
                } = d;
                return {
                    eventData: {
                        query
                    },
                    label,
                    id: name
                }
            });
            return {
                name: name,
                sysId:sysId,
                tableName: tableName,
                fields: fields,
                view: view,
                encodedQuery: encodedQuery,
                data: [{
                    data: chartData,
                    metadata: {
                        eventData: {
                            table: tableName,
                            url
                        },
                        dataSourceLabel,
                        groupBy: [{
                            series: [{
                                label: tableLabel,
                                id: "value",
                                type: "value"
                            }],
                            elements: elements,
                            label: groupByFieldLabel,
                            id: groupByField,
                            fieldType: groupByFieldType
                        }],
                        format: {
                            unitFormat: "{0}"
                        },
                        aggregateBy: 4,
                    }
                }]
            }
        });
    }

    async function getRelatedItemsEmptyStateProps(allRelatedItems, userPreferedRelatedItems) {
        const UNCONFIGURED_LABEL = await helpers.translate("This section has not been configured");
        const NO_SELECTED_ITEMS_HEADING = await helpers.translate("Click the settings icon to configure related items");
        const NO_CONFIGURED_ITEMS_HEADING = await helpers.translate("Contact your administrator to configure this section.");
        
        return {
            hideEmptyState: allRelatedItems.length !== 0 && userPreferedRelatedItems.length !== 0,
            HEADING: {"label" : UNCONFIGURED_LABEL, "level": 3},
            CONTENT: allRelatedItems.length == 0 ? NO_CONFIGURED_ITEMS_HEADING : NO_SELECTED_ITEMS_HEADING
        }
    }

    function areObjectsEqual (obj1, obj2) {
        // If both are strictly equal, return true
        if (obj1 === obj2) {
            return true;
        }

        // If either is not an object or is null, return false
        if (
            typeof obj1 !== 'object' || obj1 === null ||
            typeof obj2 !== 'object' || obj2 === null
        ) {
            return false;
        }

        // Check if they have the same number of keys
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        // Check if all keys and values are equal
        for (const key of keys1) {
            if (!keys2.includes(key) || !areObjectsEqual(obj1[key], obj2[key])) {
                return false;
            }
        }

        return true;
    }

   function validateFieldInput(fieldData, value) {
       var regex = /^-?\d+$/; //int regex
       var valid = true;
       if (value == '')
            return valid;
       switch(fieldData.internalType) {
             case "integer":
                   valid =  regex.test(value);
                   break;
             case "ip_addr":
                     const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
                     const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
                     valid = ipv4Pattern.test(value) || ipv6Pattern.test(value);
                     break;
             case "decimal":
             case "float":
                     regex = /^-?\d*\.?\d+$/;
                     valid =  regex.test(value);
                   break;
               default:
                     valid = true;
                     break;         
       }       
       return valid;
   }

    return {
        NAVIGATION_ITEM_KEY,
        DATA_RESOURCES,
        IMPORTANT_ATTRIBUTES_SECTION_LABEL,
        RELATED_ITEMS_USER_PREFERENCE,
        SAVED_HIGHLIGHTED_VALUE_ID,
        initDataFetchState,
        updateDataFetchState,
        setNavItems,
        setNavChildItems,
        findNavItemByPath,
        transformResources,
        setResources,
        setAttributes,
        getAttributeSections,
        excludeUnauthorizedFields,
        formatLabelValue,
        formatIntoColumns,
        getEmptyStateForSection,
        handleReferenceLinkClick,
        setFieldsMetadata,
        getSelectedItemsIds,
        getAvailableItems,
        getSelectedItems,
        getRelatedItems,
        getRelatedItemsEmptyStateProps,
        setLoadingState,
        closeEditMode,
        buildNotificationItems,
        buildWarningNotificationItems,
        buildSuccessNotificationItems,
        buildErrorNotificationItems,
        isEmpty,
        isEmptyObj,
        areObjectsEqual,
        validateFieldInput
	}
}
