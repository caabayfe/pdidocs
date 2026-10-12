var UXADAFilterService = Class.create();
UXADAFilterService.prototype = {
    initialize: function() {
        this.filterDetailsMap = {};
        this.filterItems = [];
        this.FILTER_TYPE = 'filter_type';
        this.FILTER_ID = 'filter_id';
        this.FIELDS = 'fields';
    },

    _getAllowedItemsForTargetPanel: function(source) {
        const allowedItems = [];
        // if type appsee get the filter ID directly.
        if (source?.type === UXAConstants.APPSEE) {
            allowedItems.push(source.payload.UXAFilterId);
        } else {
            allowedItems.push(source.payload.table);
        }
        return allowedItems;
    },

    _buildFilterMetadata: function(filterType, dataSource, source, mode) {
        // get the list of available filters for 'appsee' source type
        // if mode is taget then get the list of items to be selectable by user.
        const allowedItems = (mode === UXAConstants.DA_MODE_TARGET) ? this._getAllowedItemsForTargetPanel(source) : [];
        const gr = new GlideRecord(UXAConstants.UXA_FILTER_TABLE);
        gr.addQuery('source_type', dataSource);
        // if filterType is choice get the single and multi select filters
        if (filterType && (filterType === UXAConstants.CHOICE_FILTER_TYPE || filterType === UXAConstants.REFERENCE_FILTER_TYPE)) {
            gr.addQuery(this.FILTER_TYPE, UXAConstants.SINGLE_SELCT_FILTER_TYPE).addOrCondition(this.FILTER_TYPE, UXAConstants.MULTI_SELECT_FILTER_TYPE);
        }
        gr.query();
        while (gr.next()) {
            this._generateMetadataItems(gr.getValue(this.FILTER_ID), gr.getValue('label'), mode === UXAConstants.DA_MODE_TARGET && !allowedItems.includes(gr.getValue(this.FILTER_ID)), JSON.parse(gr.getValue('params') || '[]'));
        }
        // get custom user properties
        new QueryServiceAPI().getCustomUserProperties().forEach(({
            k: filterId,
            v: label,
            metadata
        }) => {
            const shoulDisableFilterItem = mode === UXAConstants.DA_MODE_TARGET && !(allowedItems.includes(metadata?.table) || allowedItems.includes(filterId));
            this._generateMetadataItems(filterId, label, shoulDisableFilterItem, []);
            this.filterDetailsMap[filterId].metadata = metadata;
        });
    },

    _generateInitialPayload: function(dataSource, payload) {
        return {
            fields: [{
                id: UXAConstants.FILTER_SELECTED_KEY,
                label: UXAConstants.DA_DATA_SOURCE_LABEL,
                type: UXAConstants.DA_DATA_SOURCE_TYPE_SELECTOR,
                placeholder: UXAConstants.DA_DATA_SOURCE_PLACE_HOLDER,
                helperText: UXAConstants.DA_DATA_SOURCE_LABEL,
                staticItems: this.filterItems,
            }],
            targetOverrides: [{
                type: dataSource,
                payload: payload
            }],
        };
    },

    _generateMetadataItems: function(filterId, label, disabled = false, params = []) {
        if (UXAConstants.EXCLUDED_FILTERS_FOR_RESOLUION_API.includes(filterId)) {
            return;
        }
        this.filterItems.push({
            id: filterId,
            label: label,
            disabled
        });
        this.filterDetailsMap[filterId] = {
            params: params,
            label: label,
            filterId: filterId,
            disabled
        };
    },

    _generateRendererForFilter: function(filterData) {
        return {
            'id': filterData['filterId'],
            'label': filterData['label'],
            'type': 'selector',
            'placeholder': 'Select',
            'helperText': 'UX Analytics',
            'dataAPI': `/api/sn_uxa_req_manager/uxa_data/filter/data?filterId=${filterData['filterId']}`
        };
    },

    handleResolutionApi: function(
        payload,
        filterType,
        dataSource,
        mode = 'source',
        source = null
    ) {
        this._buildFilterMetadata(filterType, dataSource, mode, source);
        const initialPayload = this._generateInitialPayload(dataSource, payload);
        if (Object.keys(payload).length == 0 || !payload[UXAConstants.FILTER_SELECTED_KEY]) {
            return initialPayload;
        } else {
            // get the details of each payload to render the next required content on source panel
            // get the last selected filter
            const selectedFilter = payload[UXAConstants.FILTER_SELECTED_KEY];
            const filterDetails = this.filterDetailsMap[selectedFilter];

            // check if associated filter has params to genrate next filtering field
            if (filterDetails?.params?.length > 0) {
                // get the data for the filter defined in param.
                const paramData = this.filterDetailsMap[filterDetails.params[0]];
                const renderer = this._generateRendererForFilter(paramData);
                initialPayload[this.FIELDS].push(renderer);
            }

            initialPayload['configPayload'] = this.getConfigPayload(payload, dataSource);
            // setting the labels for each selected items
            initialPayload[this.FIELDS] = initialPayload[this.FIELDS].map((field) => {
                if (payload[field['id']]) {
                    field['value'] = payload[field['id']];
                }
                return field; // Ensure the field object is returned for the map
            });
        }
        return initialPayload;
    },

    getConfigPayload: function(payload, dataSource) {
        const selectedFilter = payload[UXAConstants.FILTER_SELECTED_KEY];
        if (selectedFilter.includes('UserProperties')) {
            const filterDetails = this.filterDetailsMap[selectedFilter];
            return {
                type: 'table',
                payload: {
                    ...payload,
                    ...filterDetails.metadata
                }
            };
        }
        return {
            type: dataSource,
            payload
        };
    },

    handleLabelApi(payload) {
        this._buildFilterMetadata(null, UXAConstants.APPSEE);
        return this.filterDetailsMap[payload]?.label || payload;
    },
    type: 'UXADAFilterService'
};
