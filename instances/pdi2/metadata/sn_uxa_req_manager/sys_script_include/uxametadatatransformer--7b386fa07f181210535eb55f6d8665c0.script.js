var UXAMetadataTransformer = Class.create();
UXAMetadataTransformer.prototype = {
    initialize: function() {},

    transform: function(response, selectedValues, filterId, payload) {
        if (UXAConstants.UXA_FILTER_ID.USER_DETAILS == filterId)
            this._updateUserDetailsDates(response);

        let dropdownData = this._populateDropdownData(response, filterId);
        let userSelectedValuesForAvailableItems = this._populateAvailableItems(dropdownData, selectedValues, filterId);


        const dataToSend = {
            "value": {
                "nextRecordIdx": -1,
                "availableElements": userSelectedValuesForAvailableItems.length > 0 ? userSelectedValuesForAvailableItems : dropdownData,
                "unavailableElements": []
            }
        };

        return dataToSend;


    },

    _populateAvailableItems: function(dropdownData, selectedValues, filterId) {
        let userSelectedValuesForAvailableItems = [];
        if (Array.isArray(selectedValues) && selectedValues.length > 0) {
            if (UXAConstants.UXA_FILTER_ID.DEVICE == filterId && (this.detectResponseFormat(response) === 'group_array_object')) {
                const filteredElements = dropdownData.map(dropdownObject => {
                    const filteredItems = dropdownObject.items.filter(item => selectedValues.includes(item.id));
                    return {
                        ...dropdownObject,
                        items: filteredItems
                    };
                }).filter(dropdownObject => dropdownObject.items.length > 0);

                userSelectedValuesForAvailableItems = [...userSelectedValuesForAvailableItems, ...filteredElements];
            } else {
                selectedValues.forEach((value) => {
                    const availableValueInDropdownData = dropdownData.filter(data => data.id == value);
                    userSelectedValuesForAvailableItems = [...userSelectedValuesForAvailableItems, ...availableValueInDropdownData];
                });
            }
        }
        return userSelectedValuesForAvailableItems;
    },

    _populateDropdownData: function(response, filterId) {
        const dropdownData = [];

        if (UXAConstants.UXA_FILTER_ID.DEVICE == filterId && (this.detectResponseFormat(response) === 'group_array_object')) {
            response?.forEach(element => {
                const keys = Object.keys(element);
                keys.forEach(key => {
                    const dropdownObject = {
                        label: key,
                        items: []
                    };
                    element[key].forEach(item => {
                        if (item && item.v) {
                            const filterItem = {
                                id: '' + item.k,
                                label: item.v
                            };
                            dropdownObject.items.push(filterItem);
                        }
                    });
                    dropdownData.push(dropdownObject);
                });
            });
        } else if (UXAConstants.UXA_FILTER_ID.EVENT === filterId && this.detectResponseFormat(response) === 'array_object') {
            response?.forEach(item => {
                if (item) {
                    if (item.v) {
                        const filterItem = {
                            id: '' + item.v,
                            label: item.v
                        };
                        if (item.metadata)
                            filterItem.metadata = item.metadata;

                        dropdownData.push(filterItem);
                    }
                }
            });
        } else {
            response?.forEach(item => {
                if (item) {
                    if (item.v) {
                        const filterItem = {
                            id: '' + item.k,
                            label: item.v
                        };
                        if (item.metadata)
                            filterItem.metadata = item.metadata;

                        dropdownData.push(filterItem);
                    } else {
                        // For cases where the response is just array of strings
                        dropdownData.push({
                            id: '' + item,
                            label: '' + item
                        });
                    }
                }
            });
        }
        return dropdownData;
    },

    _updateUserDetailsDates: function(response) {
        const utils = new UXAUtils();
        response?.forEach(item => {
            if (item.k == 'max_session_time' || item.k == 'min_session_time')
                item.v = item.v ? utils.getUserDateTime(item.v) : item.v;
            if (item.k == 'is_anonymous_user')
                item.v = item?.v?.toString() || 'false';
        });

    },

    detectResponseFormat: function(response) {
        if (Array.isArray(response) && response.length > 0) {
            const firstElement = response[0];

            // Check for grouped metadata: Object with a single key pointing to an array
            if (typeof firstElement === 'object' && !Array.isArray(firstElement)) {
                const keys = Object.keys(firstElement);
                if (keys.length === 1 && Array.isArray(firstElement[keys[0]]))
                    return 'group_array_object';
            }

            // Check for array of object: Array of objects with 'k' and 'v' properties
            if (typeof firstElement === 'object' && 'k' in firstElement && 'v' in firstElement)
                return 'array_object';

            // Check for st: Aring array
            if (typeof firstElement === 'string')
                return 'array_string';
        }
        return 'Unknown Format';
    },

    type: 'UXAMetadataTransformer'
};
