/**
 * @param {params} params
 * @param {*} proxyArg 
 * @param {{api: params["api"], event: params["event"], helpers: params["helpers"], imports: params["imports"]}} params 
 * @returns 
 */
function exploreCiMainContentUtils(proxyArg, params) {
    const { api, event, helpers, imports } = params;

    const {
        NAVIGATION_ITEM_KEY,
        IMPORTANT_ATTRIBUTES_SECTION_LABEL,
        excludeUnauthorizedFields,
        formatLabelValue,
        formatIntoColumns
    } = imports["sn_cmdb_ws.ExploreCIUtils"](params);

    function handleFormDataPropsChange(formDataProps) {
        const {fields, sections} = formDataProps;
        const filteredSections = sections?.map(section => excludeUnauthorizedFields(fields, section));

        filteredSections?.forEach(section => {
            section?.rows?.forEach(row => {
                row.forEach(column => {
                    column?.fields?.forEach((field, index) => {
                        const labelValueObj = formatLabelValue({...fields[field]});
                        fields[field] = {
                            ...fields[field],
                            labelValueObj
                        };
                    })
                })
            })
        });
        const [summarySection, ...remainingSections] = filteredSections;
        const impAttrSection = remainingSections?.find(sectionObj => sectionObj.caption === IMPORTANT_ATTRIBUTES_SECTION_LABEL);
        const summarySectionFields = summarySection.rows
            ?.flatMap(row => row.flatMap(column => column.fields));
            
        let summaryData = summarySectionFields.map(field => fields[field]?.labelValueObj);
        const numOfColumns = 4;
        const summaryDataHeaderSection = formatIntoColumns(summaryData.splice(0, numOfColumns), numOfColumns);
        const summaryDataExpandSection = formatIntoColumns(summaryData, numOfColumns);

        //split summary section attributes evenly into 2 columns
        const summarySectionTwoColumnLayout = Array.from({ length: 2 }, (_, columnIndex) => {
            const columnFields = summarySectionFields.filter((_, i) => i % 2 === columnIndex);
            return {
                fields: columnFields
            };
        });

        api.setState('summaryDataHeaderSection', summaryDataHeaderSection);
        api.setState('summaryDataExpandSection', summaryDataExpandSection);
        api.setState('summarySection', {
            sysId: summarySection.sysId,
            captionDisplay: summarySection.captionDisplay,
            rows: [summarySectionTwoColumnLayout]
        });

        api.setState('impAttrSection', impAttrSection);
        if(remainingSections && remainingSections.length>0) {
            api.setState('attributeSections', remainingSections.filter(section => section.caption != IMPORTANT_ATTRIBUTES_SECTION_LABEL));
        }
    }

    function handleSelectedNavPropsChange(selectedNavProps) {
        if (selectedNavProps.item) {
            const selectedNav = selectedNavProps.item[0][0];
            api.setState("selectedPageId", selectedNav);

            // Toggle summary expansion based on nav item and if data is available (button is not disabled)
            if (!api.state.disableExpandCollapseButton) {
                api.setState('expandSummary', selectedNav === NAVIGATION_ITEM_KEY.SUMMARY);
            }
            if (selectedNav === NAVIGATION_ITEM_KEY.CMDB360 &&
                !api.state.dataFetchState[api.state.dataResources.multisource_data_preview]?.fetchedOnce) {
                api.data.multisource_data_preview.refresh();
            } else if (selectedNav === NAVIGATION_ITEM_KEY.SERVICE_AND_OFFERING &&
                !api.state.dataFetchState[api.state.dataResources.get_service_and_offering]?.fetchedOnce) {
                api.data.get_service_and_offering.refresh();
            } else if (selectedNav === NAVIGATION_ITEM_KEY.HEALTH) {
                api.data.get_cmdb_health_scores_for_ci.refresh();
            } else if (selectedNav == NAVIGATION_ITEM_KEY.ACTIVITY) {
                api.data.get_related_items.refresh();
            } else if (selectedNav === NAVIGATION_ITEM_KEY.RELATIONSHIPS) {
                api.data.get_relationship_card_data.refresh();
            }
        }
    }

    /**
     * Finds the starting index for a page in the tags array.
     * @private
     */
    function _findTagsPageStartIndex(tags, pageSize, pageIndex) {
        const itemsToSkip = pageIndex * pageSize;
        if (itemsToSkip === 0) {
            return 0;
        }
    
        let nonDeletedSeen = 0;
        for (let i = 0; i < tags.length; i++) {
            if (nonDeletedSeen >= itemsToSkip) {
                return i; // This is the index where the page starts.
            }
            if (!tags[i].deleted) {
                nonDeletedSeen++;
            }
        }
    
        // If we've seen enough items to skip right at the end, the start index is the array length.
        if (nonDeletedSeen >= itemsToSkip) {
            return tags.length;
        }
    
        return -1; // Page is out of bounds.
    }
  
    /**
     * Calculates the slice of an array for a given page, including deleted objects,
     * but bases the page size on non-deleted objects.
     *
     * @param {Array} tags - tags array
     * @param {number} pageSize - page size
     * @param {number} pageIndex - page index
     * @returns {Array} - array of tags for the given page
     */
    function getTagsPageSlice(tags, pageSize, pageIndex) {
        const startIndex = _findTagsPageStartIndex(tags, pageSize, pageIndex);
    
        if (startIndex === -1 || startIndex >= tags.length) {
            return [];
        }
    
        // Now, find the end index of our page slice.
        let endIndex = startIndex;
        let nonDeletedInPage = 0;
        for (let i = startIndex; i < tags.length; i++) {
            endIndex = i;
            if (!tags[i].deleted) {
                nonDeletedInPage++;
            }
            if (nonDeletedInPage === pageSize) {
                break;
            }
        }
    
        return tags.slice(startIndex, endIndex + 1);
    }
  
    /**
     * Derives the index of an item from the original array given its page and its index within that page's slice.
     *
     * @param {Array} tags - tags array
     * @param {number} pageSize - page size
     * @param {number} pageIndex - page index
     * @param {number} pageItemIndex - index of the item within the page's slice (which includes deleted items)
     * @returns {number} - index in the original array, or -1 if not found
     */
    function getTagsOriginalIndex(tags, pageSize, pageIndex, pageItemIndex) {
        const startIndex = _findTagsPageStartIndex(tags, pageSize, pageIndex);
    
        if (startIndex === -1) {
            return -1; // Page is out of bounds.
        }
    
        const originalIndex = startIndex + pageItemIndex;
    
        if (originalIndex >= tags.length) {
            return -1;
        }
    
        return originalIndex;
    }

    return {
        handleFormDataPropsChange,
        handleSelectedNavPropsChange,
        getTagsPageSlice,
        getTagsOriginalIndex
    }
}
