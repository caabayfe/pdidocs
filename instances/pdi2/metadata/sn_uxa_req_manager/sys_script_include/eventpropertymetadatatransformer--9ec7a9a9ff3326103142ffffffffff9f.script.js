var EventPropertyMetadataTransformer = Class.create();
EventPropertyMetadataTransformer.prototype = {
    initialize: function() {
        this.metadataTransformer = new UXAMetadataTransformer();
    },
    transform: function(response, selectedValues, filterId, payload) {
        let dropdownData = this.metadataTransformer._populateDropdownData(response, filterId);

        // For UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY and UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY_VALUE
        if (dropdownData && Array.isArray(dropdownData) && dropdownData.length > 0) {
            const eventRecordGR = new GlideRecord(UXAConstants.TABLE.EVENT_REPOSITORY);
            eventRecordGR.addQuery(UXAConstants.APP_ID, payload.app_sys_id);
            if (payload.event_name)
                eventRecordGR.addQuery(UXAConstants.EVENT_ID, payload.event_name);
            eventRecordGR.query();

            // Map to store property labels from the table
            let customLabels = {};
            let eventLabels = {};

            // Collect all properties from the repository
            while (eventRecordGR.next()) {
                const eventName = eventRecordGR.getValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.NAME);
                const eventDisplayName = eventRecordGR.getValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.DISPLAY_NAME) || eventName;
                eventLabels[eventName] = eventDisplayName;
                try {
                    const recordProperties = eventRecordGR.getValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.PROPERTIES) ?
                        JSON.parse(eventRecordGR.getValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.PROPERTIES)) : {};

                    // Store all updatedLabels from the repository
                    Object.keys(recordProperties).forEach(propId => {
                        if (recordProperties[propId]) {
                            customLabels[propId] = recordProperties[propId];

                        }
                    });
                } catch (error) {
                    return {
                        status: 'error',
                        message: error.message
                    };
                }
            }
            if (filterId === UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY) {
                dropdownData = dropdownData.map(item => {
                    const propertyId = item.id;
                    const propertyLabel = item.label;
                    return {
                        ...item,
                        originalLabel: propertyLabel,
                        label: customLabels[propertyId] || propertyLabel
                    };
                });
            }

            // For UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY_INDICATOR
            else if (
                filterId === UXAConstants.UXA_FILTER_ID.EVENT_PROPERTY_INDICATOR || filterId === UXAConstants.UXA_FILTER_ID.EVENT) {
                dropdownData = dropdownData.map(item => {
                    const eventID = item.id;
                    const eventLabel = item.label;
                    return {
                        ...item,
                        originalLabel: eventLabel,
                        label: eventLabels[eventID] || eventID
                    };
                });
            }
        }

        let userSelectedValuesForAvailableItems = this.metadataTransformer._populateAvailableItems(dropdownData, selectedValues, filterId);


        const dataToSend = {
            "value": {
                "nextRecordIdx": -1,
                "availableElements": userSelectedValuesForAvailableItems.length > 0 ? userSelectedValuesForAvailableItems : dropdownData,
                "unavailableElements": []
            }
        };

        return dataToSend;
    },

    type: 'EventPropertyMetadataTransformer'
};
