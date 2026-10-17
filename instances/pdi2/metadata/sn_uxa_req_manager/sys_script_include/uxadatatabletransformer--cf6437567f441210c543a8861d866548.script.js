var UXADatatableTransformer = Class.create();
UXADatatableTransformer.prototype = {
    initialize: function() {
        this.utils = new UXAUtils();
    },

    transform: function(response, uxaDTO) {
        // response = JSON.parse('{"columns": [["Name", "LowCardinality(String)"], ["Occurrences", "UInt64"]], "rows": [["sc_category", 3], ["Successful Login", 2], ["Search Result Selected", 1], ["sc_cat_item", 1], ["sp_search", 1], ["Initiate Search", 1]]}');
        // response = JSON.parse('{"columns": [["Name", "LowCardinality(String)"], ["Views", "UInt64"], ["Sessions", "UInt64"], ["Avg view time", "UInt64"]], "rows": [["CustomEvent2", 22, 5, 5], ["CustomEvent1", 20, 9, 9], ["CustomEvent3", 18, 6, 5], ["CustomEvent4", 18, 5, 4], ["CustomPage2", 7, 5, 5], ["CustomPage3", 7, 6, 5], ["CustomPage4", 6, 5, 4]]}');
        let columns = this._getColumns(response, uxaDTO);
        let rows = this._getRows(response, columns, uxaDTO);
        if (uxaDTO.getType() === 'events') {
            var mergedResponse = this.utils.getMergedResponseForEvents(response, rows, columns, uxaDTO);
            if (mergedResponse) {
                rows = mergedResponse.rows;
                columns = mergedResponse.columns;
            }
        }
        if (uxaDTO.getIsExport()) {
            //response has the transformed row and columns. UXACSVTransformer will further transform it to create the csv from response.
            return new UXACSVTransformer().transform(response, uxaDTO);
        } else {
            let result = this._getResultObject();
            columns = this.sortBySelectedColumns(columns, uxaDTO.getSelectedColumns());
            result[0].columns = columns;
            result[0].rows = rows;
            return result;
        }
    },

    sortBySelectedColumns: function (columns, selectedColumns) {
        const orderMap = new Map(
            selectedColumns.map((col, index) => [col, index])
        );

        return columns.toSorted(
            (a, b) => orderMap.get(a.key) - orderMap.get(b.key)
        );
    },

    _getColumns: function(response, uxaDTO) {
        const type = uxaDTO.getType();
        const channel = uxaDTO.getChannel();
        const resColumns = response.columns;
        let columns = [];
        const uiFields = new UXAUtils().getDatatableUIFields(type.toUpperCase(), channel, uxaDTO);
        resColumns.forEach(element => {
            const columnObj = {};
            columnObj.key = element[0];
            columnObj.type = element[1] ? UXAConstants.COLUMN_TYPE_MAPPING[element[1]] : UXAConstants.COLUMN_TYPE_MAPPING[UXAConstants.DEFAULT_FIELD_TYPE];
            if (columnObj.type == UXAConstants.COLUMN_TYPE_MAPPING.Number) {
                columnObj.headerCellAlignment = 'inverse';
                columnObj.format = UXAConstants.COLUMN_TYPE_MAPPING.Number;
            }

            if (uiFields) {
                const uiElement = uiFields[element[0]];
                columnObj.type = uiElement?.uiType || columnObj.type;
                columnObj.label = uiElement?.uiLabel || element[0];
                columnObj.format = uiElement?.uiFormat || columnObj.format;
                if (uiElement?.maxCharacters) {
                    columnObj.maxCharacters = uiElement?.maxCharacters;
                }
                if (uiElement?.disableSorting) {
                    columnObj.headerTextDisabled = true;
                }
                if (uiElement?.mandatory) {
                    columnObj.mandatory = true;
                }
                if (channel == UXAConstants.CHANNEL_ENUM.MOBILE.ID && element[0]?.toLowerCase() == 'number_of_pages')
                    columnObj.label = uiElement?.uiLabelMobile || element[0];

            } else
                columnObj.label = element[0];
            if (columnObj.key == uxaDTO.getOrderBy())
                columnObj.sortDirection = uxaDTO.getSortOrder() === UXAConstants.SORT_ORDER_ASC ? 'ascending' : 'descending';
            columns.push(columnObj);
        });
        return columns;
    },

    _getRows: function(response, columns, uxaDTO) {
        let rows = [];
        let pageFlag = false;

        if (UXAConstants.TYPE.APPLICATION == uxaDTO.getType())
            this._updateApplicationResults(response, columns, uxaDTO);
        else if (UXAConstants.TYPE.SESSIONS == uxaDTO.getType())
            this._updateSessionUserList(response, columns, uxaDTO);
        else if (UXAConstants.TYPE.USERS == uxaDTO.getType())
            this._updateUserList(response, columns, uxaDTO);

        // For TYPE.APPLICATION _updateApplicationResults() already called once.  
        if (uxaDTO.getRequestSource() == UXAConstants.UXA_DATA_CONTROLLER_SOURCE && UXAConstants.TYPE.APPLICATION != uxaDTO.getType())
            this._updateApplicationResults(response, columns, uxaDTO);

        const resRows = response.rows;
        //Export needs the transformed rows in the form of array of array. response contains the transformed rows in the required format. Hence, further processing code is not required for export.
        if (uxaDTO.getIsExport()) {
            return;
        }

        let nameLabels = {};
        if (UXAConstants.TYPE.PAGES == uxaDTO.getType() && uxaDTO.getApplicationSysId()) {
            const params = {
                app_sys_id: uxaDTO.getApplicationSysId(),
                channel: uxaDTO.getChannel()
            };
            nameLabels = new QueryServiceAPI().getPageNames(params);
            nameLabels = Object.assign({}, ...nameLabels.map(item => ({
                [item.k]: item.v
            })));
        }

        let sessionIdIndex = -1;
        let userIdIndex = -1;
        let hashedUserIdIndex = -1;
        let anonymousUserIndex = -1;
        resRows.forEach(row => {
            const rowObj = {};
            let old_value = '';
            userIdIndex = -1;
            sessionIdIndex = -1;
            anonymousUserIndex = -1;
            hashedUserIdIndex = -1;
            row.forEach((element, index) => {
                let tz = '';

                if (columns[index].key == UXAConstants.SESSION_ID_ALIAS)
                    sessionIdIndex = index;
                if (columns[index].key == UXAConstants.USER_INDEX_ALIAS)
                    userIdIndex = index;
                if (columns[index].key == UXAConstants.HASHED_USER_ID_ALIAS)
                    hashedUserIdIndex = index;
                if (columns[index].key == UXAConstants.ANONYMOUS_USER_ALIAS)
                    anonymousUserIndex = index;

                if (columns[index].key == UXAConstants.NAME_ALIAS) {
                    value = nameLabels[element] || element.value || element;
                    old_value = element.value || element;
                } else {
                    if (!element) {
                        rowObj[columns[index].key] = {
                            element,
                            key: element
                        };
                        return;
                    }
                    value = element.value || element;
                    if (uxaDTO.getType() != UXAConstants.TYPE.PERFORMANCE && columns[index].format === 'duration')
                        value = element * 1000 || element;
                    else if (columns[index].type === UXAConstants.COLUMN_TYPE_MAPPING.Number)
                        value = element.toFixed(2);
                    else if (columns[index].type === UXAConstants.COLUMN_TYPE_MAPPING.Date)
                        tz = gs.getSession().getTimeZoneName();
                }
                rowObj[columns[index].key] = {
                    value,
                    key: element.key || element
                };

                //Add old value for Name column
                if (old_value) {
                    rowObj[columns[index].key] = {
                        ...rowObj[columns[index].key],
                        old_value
                    };
                    old_value = ''; //Reset, so that it won't get added for other columns.
                }

                if (tz) {
                    rowObj[columns[index].key] = {
                        ...rowObj[columns[index].key],
                        tz,
                        displayValue: this.utils.convertUserDateTimeFormat(value)
                    };
                }
            });

            if (userIdIndex >= 0 && sessionIdIndex >= 0) {
                rowObj[columns[userIdIndex].key] = {
                    ...rowObj[columns[userIdIndex].key],
                    sessionId: rowObj[columns[sessionIdIndex].key]?.key
                };
                if (!uxaDTO.getSelectedColumns().includes(UXAConstants.SESSION_ID_ALIAS))
                    delete rowObj[columns[sessionIdIndex].key];
            }

            //DEF0602832: Update hashed user id to anonymous for anonymous users.
            if (hashedUserIdIndex >= 0 && anonymousUserIndex >= 0) {
                if (rowObj[columns[anonymousUserIndex].key].value == true)
                    rowObj[columns[hashedUserIdIndex].key].value = UXAConstants.ANONYMOUS;

                if (!uxaDTO.getSelectedColumns().includes(UXAConstants.ANONYMOUS_USER_ALIAS))
                    delete rowObj[columns[anonymousUserIndex].key];
            }
            rows.push(rowObj);
        });

        if (sessionIdIndex >= 0 && userIdIndex >= 0 && !uxaDTO.getSelectedColumns().includes(UXAConstants.SESSION_ID_ALIAS)) {
            columns.splice(sessionIdIndex, 1);
            if (anonymousUserIndex > sessionIdIndex)
                anonymousUserIndex--; //decrease index by 1, if sessionId is removed from the result.
        }
        if (anonymousUserIndex >= 0 && !uxaDTO.getSelectedColumns().includes(UXAConstants.ANONYMOUS_USER_ALIAS))
            columns.splice(anonymousUserIndex, 1);


        return rows;
    },

    _updateSessionUserList: function(response, columns, uxaDTO) {
        const channel = uxaDTO.getChannel();
        let resColumns = response.columns;
        let countryIndex = -1;
        let browserTypeIndex = -1;
        let dateIndex = -1;
        let lastLocationIndex;
        let sessionIdIndex = -1;
        let anonymousUserIndex = -1;
        let hashedUserIdIndex = -1;
        resColumns.forEach((element, idx) => {
            if (element[0] == UXAConstants.COUNTRY_ALIAS)
                countryIndex = idx;
            else if (element[0] == UXAConstants.BROWSER_ALIAS)
                browserTypeIndex = idx;
            else if (element[0] == UXAConstants.SESSION_DATE_ALIAS)
                dateIndex = idx;
            else if (element[0] == UXAConstants.LAST_LOCATION)
                lastLocationIndex = idx;
            else if (element[0] == UXAConstants.SESSION_ID_ALIAS)
                sessionIdIndex = idx;
            else if (element[0] == UXAConstants.HASHED_USER_ID_ALIAS)
                hashedUserIdIndex = idx;
            else if (element[0] == UXAConstants.ANONYMOUS_USER_ALIAS)
                anonymousUserIndex = idx;
        });

        //Get CountryCodes from results.
        const countryCodes = [];
        if (countryIndex && countryIndex < resColumns.length) {
            response.rows.forEach(row => {
                if (row[countryIndex])
                    countryCodes.push(row[countryIndex]);
            });
        }
        let countryWithCode = {};
        if (countryCodes.length)
            countryWithCode = new QueryServiceAPI().getCountryNames(countryCodes);

        const resRows = response.rows;
        response.rows = resRows.map(row => {
            if (browserTypeIndex >= 0) {
                const browser = row[browserTypeIndex];
                if (browser) {
                    row[browserTypeIndex] = this._formatDeviceDetails(channel, browser);
                }
            }
            if (countryIndex >= 0)
                row[countryIndex] = countryWithCode[row[countryIndex]] || row[countryIndex];
            if (dateIndex >= 0)
                row[dateIndex] = this.utils.getUserDateTime(row[dateIndex]);
            if (lastLocationIndex >= 0) {
                let location = this._removeEmptyValues(row[lastLocationIndex], ';');
                if (location)
                    location = this._getLocationWithCountryName(location) || location;
                row[lastLocationIndex] = location;
            }
            //if (uxaDTO.getIsExport() && hashedUserIdIndex >= 0 && anonymousUserIndex >= 0 && row[anonymousUserIndex] == false)
            //    row[hashedUserIdIndex] = UXAConstants.ANONYMOUS;

            this._updateAnonymousFieldForExport(uxaDTO, row, hashedUserIdIndex, anonymousUserIndex);

            return row;
        });
        if (uxaDTO.getIsExport() && anonymousUserIndex >= 0 && !uxaDTO.getSelectedColumns().includes(UXAConstants.ANONYMOUS_USER_ALIAS))
            response.columns.splice(anonymousUserIndex, 1);

        return response;
    },

    _updateApplicationResults: function(response, columns, uxaDTO) {
        const uxaAppUtils = new UXAApplicationUtils();
        const applications = uxaAppUtils.getAllAppsForUser();
        const channels = uxaAppUtils.getChannels();

        var applicationSet = {};
        applications.forEach(app => {
            applicationSet[app.AppSysId] = app.AppName;
        });

        let uniqueUsersIndex = -1;
        let uniqueSessionsIndex = -1;
        const averageSessionsPerUserIndex = uxaDTO.getSelectedColumns().indexOf('AVERAGE_SESSIONS_PER_USER');
        if (averageSessionsPerUserIndex >= 0)
            response.columns.forEach((element, idx) => {
                if (element[0] == UXAConstants.UNIQUE_SESSIONS)
                    uniqueSessionsIndex = idx;
                else if (element[0] == UXAConstants.UNIQUE_USERS)
                    uniqueUsersIndex = idx;
            });

        const resRows = response.rows;
        response.rows = resRows.map(row => {
            row = row.map((element, index) => {
                const app = {};
                if ([UXAConstants.NAME_ALIAS, UXAConstants.APP_NAME_ALIAS, UXAConstants.APP_NAME_SESSION_ALIAS].includes(columns[index].key)) {
                    if (uxaDTO.getIsExport()) {
                        element = applicationSet[element] || element;
                    } else {
                        app[UXAConstants.KEY] = element;
                        app[UXAConstants.VALUE] = applicationSet[element] || element;
                        element = app;
                    }

                } else if (columns[index].key == UXAConstants.CHANNEL_ALIAS) {
                    if (element == UXAConstants.CHANNEL_ENUM.NOWEXPERIENCE.NAME)
                        element = UXAConstants.CHANNEL_ENUM.NEXTEXPERIENCE.NAME;

                    if (uxaDTO.getIsExport()) {
                        element = channels[element] && channels[element].value ? channels[element].value : element;
                    } else {
                        app[UXAConstants.VALUE] = channels[element] ? channels[element].value : element;
                        app[UXAConstants.KEY] = channels[element] ? channels[element].key : element;
                        element = app;
                    }
                }
                return element;
            });
            return row;
        });

        if (averageSessionsPerUserIndex >= 0 && uniqueSessionsIndex !== -1 && uniqueUsersIndex !== -1) {
            this._updateAverageInApplicationResponse(response, columns, uxaDTO, averageSessionsPerUserIndex, uniqueSessionsIndex, uniqueUsersIndex);

            //Remove columns and respective row index values which are not part of the uxaDTO.getSelectedColumns()
            this._filterResponseByColumns(response, columns, uxaDTO);
        }

        return response;
    },

    _updateUserList: function(response, columns, uxaDTO) {
        let resColumns = response.columns;
        const channel = uxaDTO.getChannel();
        let lastLocationIndex;
        let browserIndex = -1;
        let firstSessionIndex = -1;
        let lastSessionIndex = -1;
        let anonymousUserIndex = -1;
        let hashedUserIdIndex = -1;
        const userPropertyColumns = []; // holds list of user column properties values

        resColumns.forEach((element, idx) => {
            if (element[0] == UXAConstants.BROWSERS_ALIAS)
                browserIndex = idx;
            else if (element[0] == UXAConstants.LAST_LOCATION) {
                lastLocationIndex = idx;
            } else if (element[0] == UXAConstants.FIRST_SESSION_ALIAS)
                firstSessionIndex = idx;
            else if (element[0] == UXAConstants.LAST_SESSION_ALIAS)
                lastSessionIndex = idx;
            else if (element[0] == UXAConstants.HASHED_USER_ID_ALIAS)
                hashedUserIdIndex = idx;
            else if (element[0] == UXAConstants.ANONYMOUS_USER_ALIAS)
                anonymousUserIndex = idx;
            else if (element[0].includes('UserProperties')) {
                // identify all user column properties
                userPropertyColumns.push({
                    idx,
                    field: element[0]
                });
            }
        });

        const resRows = response.rows;
        const hashedUserIds = resRows.map((row) => row[hashedUserIdIndex]);

        // get all user column value in this cache-map-object except roles and groups
        const userCache = this.utils._getUserDetails(hashedUserIds, userPropertyColumns);

        response.rows = resRows.map(row => {
            if (browserIndex >= 0 && row[browserIndex].length > 1) {
                //Create deviceInformation value by concatenating all the formatted device values. Each Device Information is shown on new line in the exported file.
                if (uxaDTO.getIsExport()) {
                    const browsers = row[browserIndex];
                    const browserDevicesDetails = browsers.map(browser => {
                        return this._formatDeviceDetails(channel, browser);
                    }).join(",");
                    row[browserIndex] = `${browserDevicesDetails}`;
                } else {
                    const browser = {};
                    browser[UXAConstants.KEY] = row[browserIndex];
                    browser[UXAConstants.VALUE] = `${row[browserIndex].length} devices`;
                    row[browserIndex] = browser;
                }

            } else if (browserIndex >= 0) {
                const browser = row[browserIndex][0];
                const value = this._formatDeviceDetails(channel, browser);
                if (uxaDTO.getIsExport())
                    row[browserIndex][0] = value;
                else {
                    row[browserIndex].key = [value];
                    row[browserIndex].value = [value];
                }
            }

            if (lastLocationIndex >= 0) {
                if (row[lastLocationIndex].length > 1) {
                    if (uxaDTO.getIsExport()) {
                        const locations = row[lastLocationIndex];
                        let userLocationDetails = locations.map(location => {
                            let locationDetails = this._removeEmptyValues(location, ';');
                            if (locationDetails)
                                return this._getLocationWithCountryName(locationDetails) || locationDetails;
                        }).join("; ");
                        //userLocationDetails = this._removeEmptyValues(userLocationDetails, ';');
                        row[lastLocationIndex] = `${userLocationDetails}`;
                    } else {
                        const locations = {};
                        locations[UXAConstants.KEY] = row[lastLocationIndex];
                        locations[UXAConstants.VALUE] = `${row[lastLocationIndex].length} locations`;
                        row[lastLocationIndex] = locations;
                    }
                } else {
                    let location = this._removeEmptyValues(row[lastLocationIndex][0], ';');
                    if (location)
                        location = this._getLocationWithCountryName(location) || location;
                    row[lastLocationIndex] = location;
                }
            }

            if (firstSessionIndex >= 0)
                row[firstSessionIndex] = this.utils.getUserDateTime(row[firstSessionIndex]);

            if (lastSessionIndex >= 0)
                row[lastSessionIndex] = this.utils.getUserDateTime(row[lastSessionIndex]);

            // transform all user property values from sysIds to display value
            userPropertyColumns.forEach(({
                idx,
                field
            }) => {
                const [, tableName, referenceField] = field.split('__');
                const respRowValue = row[idx];
                const hashedUserId = row[hashedUserIdIndex];

                // if row value is empty (exclude booleans), do nothing
                if (typeof respRowValue !== "boolean" && !respRowValue) {
                    row[idx] = '';
                    return;
                }

                // take display value from cache if available, otherwise take cell value
                row[idx] = userCache[hashedUserId][referenceField] || respRowValue;

            });

            this._updateAnonymousFieldForExport(uxaDTO, row, hashedUserIdIndex, anonymousUserIndex);
            return row;
        });

        if (uxaDTO.getIsExport() && anonymousUserIndex >= 0 && !uxaDTO.getSelectedColumns().includes(UXAConstants.ANONYMOUS_USER_ALIAS))
            response.columns.splice(anonymousUserIndex, 1);

        return response;
    },

    _updateAnonymousFieldForExport: function(uxaDTO, row, hashedUserIdIndex, anonymousUserIndex) {
        if (uxaDTO.getIsExport() && hashedUserIdIndex >= 0 && anonymousUserIndex >= 0) {
            if (row[anonymousUserIndex] == true)
                row[hashedUserIdIndex] = UXAConstants.ANONYMOUS;

            if (!uxaDTO.getSelectedColumns().includes(UXAConstants.ANONYMOUS_USER_ALIAS))
                row.splice(anonymousUserIndex, 1);
        }
    },

    _getResultObject: function() {
        return [{
            columns: [],
            rows: []
        }];
    },

    _removeEmptyValues: function(input, separator) {
        if (!input)
            return input;
        let val = input;
        val = val.replace(/ /g, "");
        return val
            .split(separator)
            .filter(value => value !== "")
            .join(separator);

    },

    _formatBrowserDetails: function(browser) {
        const [osType, osVersion, deviceType, browserType, browserVersion] = browser.split(";");
        return [osType + ":" + osVersion, deviceType, browserType + ":" + browserVersion].join(" ");
    },

    _formatMobileDeviceDetails: function(device) {
        const mobileDeviceDetails = device.split(";");
        //TODO: Show the deviceName under column Devices when the channel is mobile.
        let value = '';
        if (mobileDeviceDetails?.length)
            value = mobileDeviceDetails[3];

        return value;
    },

    _formatDeviceDetails: function(channel, val) {
        if (channel == UXAConstants.CHANNEL_ENUM.MOBILE.ID) {
            return this._formatMobileDeviceDetails(val);
        }
        return this._formatBrowserDetails(val);
    },

    _getLocationWithCountryName: function(location) {
        if (location) {
            //location format is CountryCode;Region;City
            var locationDetails = location.split(';');
            if (locationDetails?.length) {
                try {
                    const countryCode = locationDetails[0];
                    let countryWithCode = {};
                    if (countryCode?.length) {
                        //fetch the country details based on the country code
                        countryWithCode = new QueryServiceAPI().getCountryNames([countryCode]);
                        const countryName = countryWithCode[countryCode];
                        if (countryName) {
                            //replace the countryCode with countryName;
                            locationDetails[0] = countryName;
                            return locationDetails.join(", ");
                        }
                    }
                } catch (err) {
                    gs.error('Error occurred while transforming the country code to country. Location Details : ', locationDetails);
                }
            }
        }
        return location;
    },

    _updateAverageInApplicationResponse: function(response, columns, uxaDTO, averageSessionsPerUserIndex, uniqueSessionsIndex, uniqueUsersIndex) {
        const uiFields = this.utils.getDatatableUIFields(uxaDTO.getType().toUpperCase(), uxaDTO.getChannel(), uxaDTO);
        const columnName = uxaDTO.getSelectedColumns()[averageSessionsPerUserIndex];
        columns.splice(averageSessionsPerUserIndex, 0, {});
        columns[averageSessionsPerUserIndex].key = columnName;
        const uiLabel = uiFields?.[columnName]?.uiLabel || columnName;
        columns[averageSessionsPerUserIndex].label = uiLabel;
        columns[averageSessionsPerUserIndex].format = "number";

        response.columns.splice(averageSessionsPerUserIndex, 0, ['AVERAGE_SESSIONS_PER_USER', 'Float64']);

        //Compute Average
        response.rows = response.rows.map(row => {
            row.splice(averageSessionsPerUserIndex, 0, this.utils.getAverage(row[uniqueSessionsIndex], row[uniqueUsersIndex]));
            return row;
        });
    },

    _filterResponseByColumns: function(response, columns, uxaDTO) {
        const selectedColumns = uxaDTO.getSelectedColumns();
        let selectedIndexes = this.getSelectedIndexes(columns, selectedColumns, col => col.key);
        const filteredColumns = this.filterArrayByIndexes(columns, selectedIndexes);

        // Update/Change the original columns array
        columns.length = 0;
        columns.push(...filteredColumns);

        // Step 2: Filter response.columns using Name
        selectedIndexes = this.getSelectedIndexes(response.columns, selectedColumns, col => col[0]);
        response.columns = this.filterArrayByIndexes(response.columns, selectedIndexes);

        // Step 3: Filter response.rows accordingly
        response.rows = this.filterRowsByIndexes(response.rows, selectedIndexes);
    },

    getSelectedIndexes: function(source, selectedKeys, keyAccessor) {
        return source
            .map((item, index) => selectedKeys.includes(keyAccessor(item)) ? index : -1)
            .filter(index => index !== -1);
    },

    filterArrayByIndexes: function(arr, indexes) {
        return arr.filter((_, index) => indexes.includes(index));
    },

    filterRowsByIndexes: function(rows, indexes) {
        return rows.map(row => indexes.map(index => row[index]));
    },

    type: 'UXADatatableTransformer'
};
