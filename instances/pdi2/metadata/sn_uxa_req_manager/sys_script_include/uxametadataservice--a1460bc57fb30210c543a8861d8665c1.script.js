var UXAMetadataService = Class.create();
UXAMetadataService.prototype = {
    initialize: function() {
        this.uxaBaseService = new UXABaseService();
    },

    processMetadataRequest: function(params) {
        const {
            configuration: {
                payload
            },
            selectedValues,
            maxNbRecords,
            nextRecordIdx,
            search,
            sort
        } = params;

        let dropdownData = this.getMetadata(payload, selectedValues, maxNbRecords, nextRecordIdx, search, sort);
        return dropdownData;
    },

    getMetadata: function(params, selectedValues, limit, offset, search, sort) {
        const {
            UXAFilterId,
            appSysId,
            channel,
            filterConfigurations
        } = params;

        const {
            startDate,
            endDate
        } = new UXAUtils().getDateRange(filterConfigurations, null, true);

        let payload = {
            start_date: startDate,
            end_date: endDate
        };

        if (limit)
            payload.limit = limit;
        if (offset)
            payload.offset = offset;

        //set the searchText and sortOrder
        if (search)
            payload.searchText = search;
        if (sort)
            payload.sortOrder = sort;

        if (appSysId && appSysId.toUpperCase() != UXAConstants.ALL) {
            payload.app_sys_id = appSysId;
            payload.channel = new UXAUtils().getChannel(appSysId);
        }

        let response = {};
        switch (UXAFilterId) {
            /*
            case UXAConstants.UXA_FILTER_ID.APP_VERSION:
            case UXAConstants.UXA_FILTER_ID.COUNTRY:
			case UXAConstants.UXA_FILTER_ID.DEVICE:
            case UXAConstants.UXA_FILTER_ID.APPLICATION:
            case UXAConstants.UXA_FILTER_ID.CHANNEL:
            case UXAConstants.UXA_FILTER_ID.USER_TYPE:
            case UXAConstants.UXA_FILTER_ID.SESSION_TYPE:
            case UXAConstants.UXA_FILTER_ID.CONNECTIVITY:
            case UXAConstants.UXA_FILTER_ID.DEVICE_RESOLUTION:
            case UXAConstants.UXA_FILTER_ID.LOCALE:
            case UXAConstants.UXA_FILTER_ID.LANGUAGE:
            case UXAConstants.UXA_FILTER_ID.EVENT:
            case UXAConstants.UXA_FILTER_ID.EVENT_NAMES_BY_TYPE:
            case UXAConstants.UXA_FILTER_ID.BROWSER:
            case UXAConstants.UXA_FILTER_ID.OPERATING_SYSTEM:
            case UXAConstants.UXA_FILTER_ID.DEVICE_TYPE:
                break;
			*/
            case UXAConstants.UXA_FILTER_ID.EVENT_NAMES_BY_TYPE:
                payload.event_type = params.eventType || "";
                break;
            case UXAConstants.UXA_FILTER_ID.CITY:
                payload.country_code = params.countryCode || "";
                payload.region_name = params.region || "";
                break;
            case UXAConstants.UXA_FILTER_ID.REGION:
                payload.country_code = params.countryCode || "";
                break;
            case UXAConstants.UXA_FILTER_ID.BROWSER_VERSION:
                payload.browser_types = params.browser_type || params.browser || "";
                break;
            case UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY:
            case UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY_INDICATOR:
                payload.event_name = params.events || params.event_name || params.event || "";
                break;
            case UXAConstants.UXA_FILTER_ID.VERSION:
                payload.os_types = params.osType || params.os_types || "";
                break;
            case UXAConstants.UXA_FILTER_ID.APP_VERSION:
                filterConfigurations?.forEach((filter, index) => {
                    let metadataFilterId = filter.filterId?.replace('appsee.', '');
                    if (UXAConstants.UXA_FILTER_ID.OPERATING_SYSTEM == metadataFilterId)
                        params.os_types = Array.isArray(filter.values) ? filter.values[0] : filter.values;
                });
                const osValue = params.osType || params.os_types;
                if (osValue) {
                    payload.os = osValue;
                }
                break;
            case UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY_VALUE:
                payload.event_name = params.events || params.event_name;
                payload.event_property_type = params.event_property_type;
                payload.event_property_name = params.event_property_name;
                break;
            case UXAConstants.UXA_FILTER_ID.USER_DETAILS:
                payload = {
                    app_sys_id: payload.app_sys_id,
                    channel: payload.channel,
                    instance_user_id: params.userId
                };
                break;
            case UXAConstants.UXA_FILTER_ID.CUSTOM_USER_PROPERTIES:
                payload = {
                    fromSysUsersTableOnly: params.fromSysUsersTableOnly
                };
                break;
        }
        const transformedData = this.uxaBaseService.getMetadata(payload, UXAFilterId, selectedValues);
        return transformedData;
    },

    type: 'UXAMetadataService'
};
