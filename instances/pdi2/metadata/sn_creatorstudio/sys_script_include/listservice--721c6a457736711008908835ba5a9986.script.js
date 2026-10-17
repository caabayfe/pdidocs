const ListService = (function() {
    return class ListService {
        static type = "ListService";
        static UX_LIST_TABLE_NAME = "sys_ux_list";
        static UX_LIST_CATEGORY_TABLE_NAME = "sys_ux_list_category";
        static UI_LIST_TABLE_NAME = "sys_ui_list";
        static UI_LIST_ELEMENT_TABLE_NAME = "sys_ui_list_element";
        static LIST_CONFIG_ID = "ae8cff95779a311055f78f71ef5a99a6"; //creator studio list configuration id
        static CREATOR_STUDIO_TASK_TABLE_NAME = "sn_creatorstudio_task";
        static REQUEST_APP_DEFAULT_LIST_COLUMNS = [
            "number",
            "priority",
            "state",
            "assigned_to",
            "short_description",
            "sys_class_name",
        ];

        static FILTERED_LIST_SCHEMA = {
            title: "label",
            sys_id: "id",
            order: "order",
            condition: "condition",
            active: "active",
            table: "table",
            category: "categoryId",
            columns: ["selectedColumns", "defaultColumns"],
        };

        /**
         * throws error object contains errorType and message properties
         * @param {object} e - exception object
         * @param {string} type - type of error
         * @param {string} message - error message
         * @returns an object
         */
        static handleError(e, type, message) {
            const error = ErrorService.createError(type, e ? e.message : message);
            throw error;
        }

        //returns true if user has the access to the given app
        static canReadApp(appId) {
            const apps = new GlideRecordSecure("sys_scope");
            const appRecordExists = apps.get(appId);
            return appRecordExists && apps.canRead();
        }

        /**
         * Gets creator studio workspace configured list category and it's filtered lists
         *@param {string} appSysID - application sys id
         *@returns an array of objects
         */
        static getListByApplication(appSysID) {
            try {
                var categories = ListService.getCategories(appSysID);
                if (categories.length) {
                    var fieldSchema = {
                        title: "label",
                        sys_id: "id",
                        order: "order",
                        table: "table",
                    };
                    categories.forEach(function(category) {
                        var filteredLists = ListService.getFilterdList(
                            category.id,
                            null,
                            fieldSchema
                        ); // fetches all filtered lists by category
                        category.filteredLists = filteredLists;
                    }, ListService);
                }
                return {
                    list: categories,
                };
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }

        /**
         * Gets list of categories from given application
         *@param {string} appSysID - application sys id
         *@returns an array
         */
        static getCategories(appSysID) {
            try {
                var categories = [];
                var categoryGr = new GlideRecordSecure(
                    ListService.UX_LIST_CATEGORY_TABLE_NAME
                );
                categoryGr.addActiveQuery();
                categoryGr.addQuery("configuration", ListService.LIST_CONFIG_ID);
                categoryGr.addQuery("sys_scope", appSysID);
                categoryGr.orderBy("order");
                categoryGr.orderBy("title");
                categoryGr.query();
                while (categoryGr.next()) {
                    var categoryDetails = {};
                    categoryDetails["label"] = categoryGr.getDisplayValue("title") || "";
                    categoryDetails["id"] = categoryGr.getValue("sys_id");
                    categoryDetails["order"] =
                        parseInt(categoryGr.getValue("order")) || 0;
                    categoryDetails["description"] =
                        categoryGr.getDisplayValue("description") || "";
                    categories.push(categoryDetails);
                }
                return categories;
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }

        /**
         * adds additional query to gliderecord object
         *@param {Gliderecord Object} filteredListGr - sys_ux_list glide record
         *@param {string} categoryID - category sys id
         *@param {string} filteredListID - filtered list sys id
         */
        static addAdditionalQueries(
            filteredListGr,
            categoryID,
            filteredListID,
            appSysID
        ) {
            if (appSysID) {
                filteredListGr.addQuery("sys_scope", appSysID);
            }
            if (categoryID) {
                filteredListGr.addQuery("category", categoryID);
            }
            if (filteredListID) {
                filteredListGr.addQuery("sys_id", filteredListID);
            }
            filteredListGr.orderBy("order");
            filteredListGr.orderBy("title");
        }

        /**
         * creates an object of filtered list properties with the given schema
         *@param {Gliderecord Object} filteredListGr - sys_ux_list glide record
         *@param {object} fieldSchema - expected result schema
         *@returns object contains filtered list properties
         */
        static getFilteredListSchema(filteredListGr, fieldSchema) {
            try {
                const filteredList = {};
                const fields = Object.keys(fieldSchema);
                for (const field of fields) {
                    let fieldValue = "";
                    if (field === "active") fieldValue = Boolean(filteredListGr.active);
                    else if (field === "title")
                        fieldValue = filteredListGr.getDisplayValue(field);
                    else fieldValue = filteredListGr.getValue(field);
                    if (field === "columns") {
                        fieldSchema[field].forEach(function(prop) {
                            if (prop === "selectedColumns") {
                                filteredList["selectedColumns"] =
                                    ListService.getSelectedColumns(
                                        fieldValue,
                                        filteredListGr.getValue("table")
                                    ) ||
                                    ListService.getDefaultColumns(
                                        filteredListGr.getValue("table")
                                    );
                            }
                            if (prop === "defaultColumns") {
                                filteredList["defaultColumns"] = ListService.getDefaultColumns(
                                    filteredListGr.getValue("table")
                                );
                            }
                        }, ListService);
                    } else if (field === "table") {
                        filteredList[field] = ListService.getTable(fieldValue);
                    } else {
                        filteredList[fieldSchema[field]] = fieldValue;
                    }
                }
                return filteredList;
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }
        /**
         * Gets filtered list by given category id or filtered list sys id
         * @param {string} categoryID - sys_id of the category
         * @param {string} filteredListID - sys_id of the filtered list
         * @param {object} fieldSchema - expected result schema
         * @param {string} appSysID - sys_id of the application
         * @returns an array of filtered list
         */
        static getFilterdList(categoryID, filteredListID, fieldSchema, appSysID) {
            try {
                var filteredListData = [];
                var filteredListGr = new GlideRecordSecure(
                    ListService.UX_LIST_TABLE_NAME
                );
                ListService.addAdditionalQueries(
                    filteredListGr,
                    categoryID,
                    filteredListID,
                    appSysID
                );
                filteredListGr.query();
                while (filteredListGr.next()) {
                    var filteredList = ListService.getFilteredListSchema(
                        filteredListGr,
                        fieldSchema
                    );
                    filteredList && filteredListData.push(filteredList);
                }
                return filteredListData;
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }

        /**
         * Gets filtered list data by given filtered list id
         * @param {string} filteredListID - sys_id of the filtered list
         * @param {object} fieldSchema - expected result schema ex: {<field name>: <expected field name>}
         * @returns an object contains filtered list properties
         * @throws Error with errorType NOT_FOUND if filtered list not found
         */
        static getFilterdListByID(filteredListID, fieldSchema) {
            try {
                var filteredList = ListService.getFilterdList(
                    "",
                    filteredListID,
                    fieldSchema
                );
                if (filteredList.length > 0) {
                    return filteredList[0];
                } else {
                    return ListService.handleError(
                        "",
                        ErrorService.ERROR_TYPES.NOT_FOUND,
                        gs.getMessage(
                            "Filtered list not found with the sys id {0}",
                            filteredList
                        )
                    );
                }
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }
        /**
         * Gets default columns of the given table
         * @param {string} table - name of the table
         * @param {boolean} requiredOnlyIDs - pass true if only column ids are required
         * @returns an object
         */
        static getDefaultColumns(table, requiredOnlyIDs = false) {
            try {
                let columns = [];
                let listId = new GlideRecordSecure(ListService.UI_LIST_TABLE_NAME);
                listId.addQuery("view", "Default view");
                listId.addQuery("name", table);
                listId.addNullQuery("parent");
                listId.query();
                if (listId.next()) {
                    let listElement = new GlideRecord(
                        ListService.UI_LIST_ELEMENT_TABLE_NAME
                    );
                    listElement.addQuery("list_id", listId.sys_id);
                    listElement.orderBy("position");
                    listElement.query();
                    while (listElement.next()) {
                        columns.push(listElement.element.toString());
                    }
                }
                if (columns.length > 0) {
                    if (requiredOnlyIDs) {
                        return columns;
                    }
                    return ListService.getSelectedColumns(columns.join(","), table);
                }
                return columns;
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }

        /**
         * Gets label of the dotwalked column
         * @param {string} column - name of the dot-walked column ex: assigned_to.name
         * @param {string} tableName - name of the table
         * @returns a string ex: Assigned to > Name
         */
        static getDotwalkedLabel(column, tableName) {
            try {
                var fieldsArray = column.split(".");
                var columnLabel = "";
                var length = fieldsArray.length;
                fieldsArray.reduce(function(referenceTable, fieldName, index) {
                    if (referenceTable) {
                        if (index !== length - 1) {
                            columnLabel +=
                                new GlideRecord(referenceTable)
                                .getElement(fieldName)
                                .getLabel()
                                .toString() + " > ";
                            return new GlideRecord(referenceTable)
                                .getElement(fieldName)
                                .getReferenceTable();
                        } else {
                            columnLabel += new GlideRecord(referenceTable)
                                .getElement(fieldName)
                                .getLabel()
                                .toString();
                        }
                    } else {
                        columnLabel +=
                            new GlideRecord(tableName).getElement(fieldName).getLabel() +
                            " > ";
                        return new GlideRecord(tableName)
                            .getElement(fieldName)
                            .getReferenceTable();
                    }
                }, columnLabel);

                return columnLabel;
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }

        /**
         * Gets selected columns with id and label
         * @param {string} selectedColumns - columns data from sys_ux_list record ex:number,priority,assigned_to
         * @param {string} tableName - name of the table
         * @returns an array of object ex: [{id: number, label: Number}]
         */
        static getSelectedColumns(selectedColumns, tableName) {
            try {
                var columnsInList = [];
                var glideObject = new GlideRecord(tableName);
                selectedColumns &&
                    selectedColumns.split(",").forEach(function(fieldName) {
                        if (glideObject.isValidField(fieldName)) {
                            //checks whether the field is valid or not
                            columnsInList.push({
                                id: fieldName.toString(),
                                label: glideObject.getElement(fieldName).getLabel().toString(),
                            });
                        } else {
                            if (fieldName.indexOf(".") > -1) {
                                columnsInList.push({
                                    id: fieldName.toString(),
                                    label: ListService.getDotwalkedLabel(fieldName, tableName), //function to get dot walked column label
                                });
                            }
                        }
                    }, ListService);
                return columnsInList;
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }

        /**
         * Gets table data with label and id by given table
         * Using canWrite instead of canRead since read ACL is not available
         * for the table but read access is granted from the parent table
         * @param {string} table - name of the table
         * @returns an object ex: {id: table_name, label: Table Name, canRead: User access}
         */
        static getTable(table) {
            var tableGr = new GlideRecord(table);
            return {
                label: tableGr.getLabel(),
                id: tableGr.getTableName(),
                canRead: gs.hasRightsTo(`record/${table}/read`),
            };
        }

        /**
         * Creates filtered list and applicability m2m record
         * @param {string} appSysID - application sys id
         * @param {object} payload - payload to create record in sys_ux_list table {"title": "List00700","table": "x_travel_app1_request","category":"e386d4217747b11008908835ba5a99cd","order": "800"}
         * @returns an object contains newly created filtered list details.
         */
        static createFilteredList(appSysID, payload) {
            try {
                const csDataProxy = new global.CreatorStudioDataProxy();
                payload.configuration = ListService.LIST_CONFIG_ID;
                payload.sys_scope = appSysID;
                payload.columns = ListService.getDefaultColumns(
                    payload.table,
                    true
                ).toString();
                payload.order = payload.order;
                const list = csDataProxy.insert(
                    new GlideRecordSecure(ListService.UX_LIST_TABLE_NAME),
                    payload
                ); // creates list
                const workspaceConfigService =
                    new sn_creatorstudio.WorkspaceConfigurationService();
                const applicabilityID =
                    workspaceConfigService.getListApplicabilityId(appSysID);
                if (applicabilityID) {
                    workspaceConfigService.createListApplicabilityM2M(
                        list,
                        applicabilityID
                    ); //creates applicability m2m record
                }
                return ListService.getFilterdListByID(
                    list,
                    ListService.FILTERED_LIST_SCHEMA
                );
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }

        static updateFilteredList({
            sysId,
            payload
        }) {
            try {
                const csDataProxy = new global.CreatorStudioDataProxy();
                let result = "";
                var listGR = new GlideRecordSecure(ListService.UX_LIST_TABLE_NAME);
                listGR.get(sysId);
                if (!listGR.isValidRecord())
                    return ListService.handleError(
                        "",
                        ErrorService.ERROR_TYPES.NOT_FOUND,
                        gs.getMessage("Filtered list not found with the sys id {0}", sysId)
                    );
                result = csDataProxy.update(listGR, payload);
                return ListService.getFilterdListByID(
                    result,
                    ListService.FILTERED_LIST_SCHEMA
                );
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }

        //creates ui elements
        static createUIElements(columns = [], list) {
            const csDataProxy = new global.CreatorStudioDataProxy();
            columns.forEach(function(name, index) {
                var listElement = new GlideRecord(
                    ListService.UI_LIST_ELEMENT_TABLE_NAME
                );
                csDataProxy.insert(listElement, {
                    element: name,
                    position: index,
                    list_id: list,
                });
            });
        }

        // creates default ui list
        static createUIList(table) {
            try {
                const csDataProxy = new global.CreatorStudioDataProxy();
                var uiList = new GlideRecordSecure(ListService.UI_LIST_TABLE_NAME);
                const list = csDataProxy.insert(uiList, {
                    name: table,
                    view: "Default view", //setting default view
                });
                if (list) {
                    ListService.createUIElements(
                        ListService.REQUEST_APP_DEFAULT_LIST_COLUMNS,
                        list
                    );
                }
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }

        static reorderList({
            appSysID,
            payload
        }) {
            try {
                if (!ListService.canReadApp(appSysID)) {
                    return ListService.handleError(
                        "",
                        ErrorService.ERROR_TYPES.FORBIDDEN,
                        gs.getMessage(
                            "User does not have permission to access application with id {0}",
                            appSysID
                        )
                    );
                }
                if (!payload.length > 0) {
                    return ListService.handleError(
                        "",
                        ErrorService.ERROR_TYPES.FORBIDDEN,
                        gs.getMessage("payload shouldn't be empty")
                    );
                }
                const sysIDs = payload.map((item) => item.id);
                const updatedFilteredLists = [];
                const csDataProxy = new global.CreatorStudioDataProxy();
                var uiList = new GlideRecordSecure(ListService.UX_LIST_TABLE_NAME);
                uiList.addQuery("sys_id", "IN", sysIDs);
                uiList.query();
                while (uiList.next()) {
                    let requestBody = payload.find(
                        (filteredList) => filteredList.id === uiList.sys_id.toString()
                    );
                    let updatedRecordID = new global.CreatorStudioDataProxy().update(
                        uiList, {
                            order: requestBody.order,
                            category: requestBody.category,
                        }
                    );
                    if (!updatedRecordID) {
                        return ListService.handleError(
                            "",
                            ErrorService.ERROR_TYPES.UNKNOWN_ERROR,
                            gs.getMessage(
                                "An unexpected error while reordering the filtered list"
                            )
                        );
                    }
                    updatedFilteredLists.push({
                        ...requestBody,
                        label: uiList.getValue("title"),
                    });
                }
                return updatedFilteredLists;
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }
        /**
         * Delete list applicability m2m record
         * @param {string} appSysID - application sys id
         * @param {string} filteredListID - M2M contains the list id
         * @returns is not required
         */
        static deleteM2MList(appSysID, filteredListID) {
            try {
                var m2m = new GlideRecordSecure("sys_ux_applicability_m2m_list");
                m2m.addQuery("list", filteredListID);
                m2m.addQuery("sys_scope", appSysID);
                m2m.query();
                while (m2m.next()) {
                    const csDataProxy = new global.CreatorStudioDataProxy();
                    csDataProxy.deleteRecord(m2m);
                }
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }
        /**
         * Delete filtered list and applicability m2m record
         * @param {string} appSysID - application sys id
         * @param {string} sysId - Filtered list to be deleted from "sys_ux_list"
         * @returns an object contains deleted  filtered list sys_id and it's category.
         */

        static deleteFilteredList({
            appSysID,
            sysId
        }) {
            try {
                if (!ListService.canReadApp(appSysID)) {
                    return ListService.handleError(
                        "",
                        ErrorService.ERROR_TYPES.FORBIDDEN,
                        gs.getMessage(
                            "User does not have permission to access application with id {0}",
                            appSysID
                        )
                    );
                }
                var listGR = new GlideRecordSecure(ListService.UX_LIST_TABLE_NAME);
                listGR.get(sysId);
                if (!listGR.isValidRecord())
                    return ListService.handleError(
                        "",
                        ErrorService.ERROR_TYPES.NOT_FOUND,
                        gs.getMessage("Filtered list not found with the sys id {0}", sysId)
                    );
                ListService.deleteM2MList(appSysID, sysId);
                if (new global.CreatorStudioDataProxy().deleteRecord(listGR))
                    return {
                        filteredListID: sysId,
                        category: listGR.getValue("category"),
                    };
            } catch (e) {
                return ListService.handleError(
                    e,
                    ErrorService.ERROR_TYPES.UNKNOWN_ERROR
                );
            }
        }
    };
})();
