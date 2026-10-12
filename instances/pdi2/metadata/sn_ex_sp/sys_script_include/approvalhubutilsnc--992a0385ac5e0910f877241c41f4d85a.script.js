var ApprovalHubUtilSNC = Class.create();
ApprovalHubUtilSNC.prototype = {
    initialize: function() {
        this.emptyMsg = gs.getMessage('(empty)');
    },
    /*
     * To check if task configuration has tab mappings
     * return false if has mappings
     * @input : task configuration sysid
     * @output : Boolean
     */
    canEditTableColumn: function(taskConfigSysId) {
        var taskConfigMappingGr = new GlideRecord('sn_ex_sp_task_tab_configuration');
        taskConfigMappingGr.addQuery('task_configuration', taskConfigSysId);
        taskConfigMappingGr.setLimit(1);
        taskConfigMappingGr.query();
        return !taskConfigMappingGr.hasNext();
    },
    getTaskConfigurationData: function(taskConfigSysId, taskSysId) {
        var taskConfigGr = new GlideRecord('sn_ex_sp_task_configuration');
        if (taskConfigGr.get(taskConfigSysId) && Boolean(taskConfigGr.active)) {
            var taskConfigData = {};
            var record = this.getTableRecord(taskConfigGr, taskSysId);
            taskConfigData.commonInfo = this.getCommonInfo(record, taskSysId);
            taskConfigData.primaryInfo = this.getPrimaryInfo(record);
            taskConfigData.secondaryInfo = this.getSecondaryInfo(record, taskSysId);
            taskConfigData.actions = this.getActionsInfo(taskConfigGr, taskSysId);
            taskConfigData.referenceTableGr = record.referenceTableGr ? record.referenceTableGr : null;
            return taskConfigData;
        }
        return null;
    },
    getTableRecord: function(taskConfigGr, taskSysId) {
        var record = {
            taskConfigGr: taskConfigGr
        };
        record.parentTableGr = new GlideRecord(taskConfigGr.table);
        if (record.parentTableGr && record.parentTableGr.get(taskSysId) && record.parentTableGr.canRead()) {
            if (taskConfigGr.reference_column && taskConfigGr.reference_table) {
                record.referenceTableGr = this._getReferenceRecord(record.parentTableGr, taskConfigGr);
            }
        }
        return record;
    },
    _getReferenceRecord: function(parentTableGr, taskConfigGr) {
        var referenceTableGr = '';
        var referenceColumnElement = parentTableGr.getElement(taskConfigGr.reference_column);
        if (referenceColumnElement && referenceColumnElement.getED().getInternalType() == 'table_name') {
            var sysDictionaryGr = new GlideRecord('sys_dictionary');
            sysDictionaryGr.addQuery('name', taskConfigGr.table);
            sysDictionaryGr.addQuery('internal_type', 'document_id');
            sysDictionaryGr.addActiveQuery();
            sysDictionaryGr.query();
            if (sysDictionaryGr.next()) {
                var documentIdColumn = sysDictionaryGr.element;
                if (parentTableGr[documentIdColumn]) {
                    referenceTableGr = parentTableGr[documentIdColumn].getRefRecord();
                }
            }
        } else {
            referenceTableGr = parentTableGr[taskConfigGr.reference_column] ? parentTableGr[taskConfigGr.reference_column].getRefRecord() : '';
        }
        if (referenceTableGr && referenceTableGr.canRead()) {
            var taskTable = referenceTableGr.getTableName();
            var tableGr = new GlideTableHierarchy(taskTable);
            var parentTaskTable = tableGr.getBase();
            if (taskTable == taskConfigGr.reference_table || parentTaskTable == taskConfigGr.reference_table) {
                return referenceTableGr;
            }
        }
        return '';
    },
    getCommonInfo: function(record, taskSysId) {
        var commonInfo = {};
        commonInfo.taskSysId = taskSysId;
        commonInfo.linkToTask = record.taskConfigGr.link_to_task;
        if (commonInfo.linkToTask && !gs.nil(record.taskConfigGr.reference_table)) {
            var extensions = new GlideTableHierarchy('task').getAllExtensions();
            if (extensions.indexOf(record.taskConfigGr.reference_table.toString()) == -1) {
                commonInfo.external = Boolean(record.taskConfigGr.external);
                var urlSource = record.taskConfigGr.url_source;
                var parameter = record.taskConfigGr.page_parameters;
                var params = '';
                for (var key in parameter) {
                    params = params + '&' + key + '=' + this._replaceMacros(record, parameter[key]);
                }
                if (!urlSource || urlSource == 'page') {
                    var pageGr = record.taskConfigGr['internal_link'].getRefRecord();
                    if (pageGr.isValidRecord())
                        commonInfo.Url = "?id=" + pageGr.id + params;
                } else {
                    if (urlSource == 'field') {
                        commonInfo.Url = record.referenceTableGr.getDisplayValue(record.taskConfigGr.url);
                    } else {
                        commonInfo.Url = this._replaceMacros(record, record.taskConfigGr.url_custom.getDisplayValue());
                    }
                    if (params) {
                        if (commonInfo.Url.includes('?')) {
                            commonInfo.Url = commonInfo.Url + params;
                        } else {
                            commonInfo.Url = commonInfo.Url + '?' + params.substring(1);
                        }
                    }
                }
            }

        }
        commonInfo.fields = this.getCommonInfoFields(record);
        return commonInfo;
    },
    getActionsInfo: function(taskconfigGr, taskSysId) {
        var actions = {};
        actions.sysId = taskSysId.toString();
        actions.table = taskconfigGr.table.toString();
        if (taskconfigGr.action_group_record) {
            actions.groupId = taskconfigGr.action_group_record.toString();
        }
        return actions;
    },
    getCommonInfoFields: function(record) {
        var commonInfoFieldsObj = [];
        if (record.taskConfigGr.info_fields_type == 'fields' || record.taskConfigGr.info_fields_type.nil()) {
            if (record.parentTableGr && record.taskConfigGr.common_info_fields) {
                commonInfoFieldsObj = this.getFieldsInformation(record.parentTableGr, record.taskConfigGr.common_info_fields.split(','));
            }
        } else if (record.parentTableGr && record.taskConfigGr.info_custom_fields) {
            commonInfoFieldsObj = this._replaceMacrosWithFields(record, record.taskConfigGr.info_custom_fields);
        }
        return commonInfoFieldsObj;
    },
    getPrimaryInfo: function(record) {
        var primaryInfo = {};
        primaryInfo.primaryInfoHeader = this._getPrimaryInfoHeader(record.taskConfigGr);
        primaryInfo.widget = Boolean(record.taskConfigGr.widget);
        if (!primaryInfo.widget) {
            primaryInfo.title = this._getTitle(record);
            primaryInfo.fields = this.getPrimaryInfoFields(record);
        } else {
            primaryInfo.widgetName = record.taskConfigGr.widget_record && record.taskConfigGr.widget_record.id ? record.taskConfigGr.widget_record.id.toString() : '';
            primaryInfo.widgetParams = this._replaceMacrosInObject(record, record.taskConfigGr.widget_parameters);
        }
        return primaryInfo;
    },
    _getPrimaryInfoHeader: function(taskConfigGr) {
        var primaryInfoHeader = '';
        if (taskConfigGr.table == 'sysapproval_approver') {
            primaryInfoHeader = primaryInfoHeader.concat(gs.getMessage('Approval')).concat(' | ');
        }
        primaryInfoHeader = primaryInfoHeader.concat(taskConfigGr.getDisplayValue('name'));
        return primaryInfoHeader;
    },
    _getTitle: function(record) {
        if (record.parentTableGr) {
            if (record.taskConfigGr.title_type == 'field') {
                return record.parentTableGr.getDisplayValue(record.taskConfigGr.title);
            } else {
                var title = record.taskConfigGr.title_custom.getDisplayValue();
                title = this._replaceMacros(record, title);
                return title;
            }
        }
        return '';
    },
    _replaceMacrosInObject: function(record, paramsObj) {
        if (paramsObj) {
            for (var key in paramsObj) {
                paramsObj[key] = this._replaceMacros(record, paramsObj[key]);
            }
        }
        return paramsObj;
    },
    _replaceMacrosWithFields: function(record, field) {
        var information = [];
        try {
            var macros = field.match(/\{(.+?)\}/g);
            if (macros && macros.length > 0) {
                var macroValueMap = {};
                for (var i = 0; i < macros.length; i++) {
                    if (macroValueMap[macros[i]]) {
                        continue;
                    }
                    var macroField = macros[i].substring(macros[i].indexOf('{') + 1, macros[i].indexOf('}')).trim();
                    if (macroField.startsWith('table') && record.parentTableGr) {
                        tableGr = record.parentTableGr;
                    } else if (macroField.startsWith('reference_table') && record.referenceTableGr) {
                        tableGr = record.referenceTableGr;
                    }
                    var dotField = macroField.substring(macroField.indexOf('.') + 1);
                    var fieldElement = tableGr.getElement(dotField);
                    if (fieldElement != null) {
                        var fieldObject = {};
                        fieldObject.label = fieldElement.getLabel();
                        fieldObject.fieldType = fieldElement.getED().getInternalType();
                        var objectName = fieldElement.sys_class_name;
                        fieldObject.type = 'text';
                        if (objectName) {
                            objectName = objectName.toString();
                            fieldObject.type = objectName;
                            fieldObject.sysId = fieldElement.toString();
                        }
                        var displayValue = tableGr.getDisplayValue(dotField);
                        fieldObject.value = displayValue ? displayValue : this.emptyMsg;
                        information.push(fieldObject);
                    }
                }
            }
        } catch (e) {
            return information;
        }
        return information;
    },
    _replaceMacros: function(record, field) {
        try {
            var macros = field.match(/\{(.+?)\}/g);
            if (macros && macros.length > 0) {
                var macroValueMap = {};
                for (var i = 0; i < macros.length; i++) {
                    if (macroValueMap[macros[i]]) {
                        continue;
                    }
                    macroValueMap[macros[i]] = this._getFieldValueFromMacro(record, macros[i].substring(macros[i].indexOf('{') + 1, macros[i].indexOf('}')).trim());
                    if (!macroValueMap[macros[i]]) {
                        macroValueMap[macros[i]] = '';
                    }
                    field = field.replaceAll(macros[i], macroValueMap[macros[i]]);
                }
            }
        } catch (e) {
            return field;
        }
        return field;
    },
    _getFieldValueFromMacro: function(record, macro) {
        var dotField = macro.substring(macro.indexOf('.') + 1);
        if (macro.startsWith('table') && record.parentTableGr) {
            return this._getFieldValue(record.parentTableGr, dotField);
        } else if (macro.startsWith('reference_table') && record.referenceTableGr) {
            return this._getFieldValue(record.referenceTableGr, dotField);
        }
    },
    _getFieldValue: function(glideRecord, fieldName) {
        return glideRecord.getDisplayValue(fieldName);
    },
    getPrimaryInfoFields: function(record) {
        var primaryInfoFieldsObj = [];
        if (record.parentTableGr) {
            if (record.taskConfigGr.fields) {
                primaryInfoFieldsObj = primaryInfoFieldsObj.concat(this.getFieldsInformation(record.parentTableGr, record.taskConfigGr.fields.split(',')));
            }
            if (record.referenceTableGr && record.taskConfigGr.fields_reference) {
                primaryInfoFieldsObj = primaryInfoFieldsObj.concat(this.getFieldsInformation(record.referenceTableGr, record.taskConfigGr.fields_reference.split(',')));
            }
        }
        return primaryInfoFieldsObj;
    },
    getCatItemFieldsInfo: function(record, fieldNames) {
        var fields = [];
        if (record.sys_class_name == 'sc_req_item' && !record.cat_item.nil()) {
            var catalogItemJS = new sn_sc.CatItem(record.cat_item);
            var cartItemDetail = catalogItemJS.getItemSummary(true);
        }
        fieldNames.forEach(function(fName) {
            if ((!fName || fName == ''))
                return;
            var hidePrice = (fName == 'price' || fName == 'recurring_price') && !cartItemDetail.show_price;
            if (hidePrice)
                return;
            var hideQuantity = (fName == 'quantity') && !cartItemDetail.show_quantity;
            if (hideQuantity)
                return;
            var fElement = record.getElement(fName);
            if (!fElement)
                return;
            if (!fElement.canRead())
                return;
            var fieldObject = {};
            fieldObject.label = fElement.getLabel();
            fieldObject.fieldType = fElement.getED().getInternalType();
            var objectName = fElement.sys_class_name;
            fieldObject.type = 'text';
            if (objectName) {
                objectName = objectName.toString();
                fieldObject.type = objectName;
                fieldObject.sysId = fElement.toString();
            }
            var displayValue = (fName == 'recurring_price' && !record.recurring_frequency.nil()) ? (fElement.getDisplayValue() + " " + record.getDisplayValue('recurring_frequency')) : fElement.getDisplayValue();
            fieldObject.value = displayValue ? displayValue : this.emptyMsg;
            fields.push(fieldObject);
        });
        return fields;
    },
    /*
     * gets information of fields for a given table  
     * @input : table gliderecord 
     * @input : fields 
     * @output : object 
     */
    getFieldsInformation: function(tableGr, fields) {
        if ((tableGr.sys_class_name && tableGr.sys_class_name.toString() === 'sc_req_item') || tableGr.getTableName() === 'sc_req_item') {
            return this.getCatItemFieldsInfo(tableGr, fields);
        }
        var information = [];
        for (var i = 0; i < fields.length; i++) {
            var field = tableGr.getElement(fields[i]);
            if (field != null) {
                var fieldObject = {};
                fieldObject.field = fields[i];
                fieldObject.label = field.getLabel();
                fieldObject.fieldType = field.getED().getInternalType();
                var objectName = field.sys_class_name;
                fieldObject.type = 'text';
                if (objectName) {
                    objectName = objectName.toString();
                    fieldObject.type = objectName;
                    fieldObject.sysId = field.toString();
                }
                var displayValue = tableGr.getDisplayValue(fields[i]);
                fieldObject.value = displayValue ? displayValue : this.emptyMsg;;
                information.push(fieldObject);
            }
        }
        return information;
    },
    /*
     * Gets reference field of type table for a given reference table 
     * @input : table in which the reference exists 
     * @input : referenceTable name  for which the reference field is being looked for 
     * @output : string 
     */
    getReferenceField: function(table, referenceTable) {
        var dictionary = new GlideRecord('sys_dictionary');
        dictionary.addActiveQuery();
        dictionary.addQuery('name', table);
        dictionary.addQuery('internal_type', 'reference');
        dictionary.addQuery('reference', referenceTable);
        dictionary.setLimit(1);
        dictionary.query();
        if (dictionary.next()) {
            return dictionary.element.getDisplayValue();
        }
    },
    getSecondaryInfo: function(record, taskSysId) {
        var secondaryInfo = {};
        var tabs = [];
        var taskTabConfigGr = new GlideRecord('sn_ex_sp_task_tab_configuration');
        taskTabConfigGr.addActiveQuery();
        taskTabConfigGr.addQuery('task_configuration', record.taskConfigGr.getUniqueValue());
        taskTabConfigGr.orderBy('order');
        taskTabConfigGr.orderBy('sys_created_on');
        taskTabConfigGr.query();
        while (taskTabConfigGr.next()) {
            var tableGr = record.parentTableGr;
            if (record.referenceTableGr) {
                tableGr = record.referenceTableGr;
            }
            if (taskTabConfigGr.script) {
                var visibilityScript = taskTabConfigGr.visibility_script;
                if (visibilityScript) {
                    var evaluator = new GlideScopedEvaluator();
                    evaluator.putVariable('current', tableGr);
                    evaluator.putVariable('answer', null);
                    var response = evaluator.evaluateScript(taskTabConfigGr, 'visibility_script');
                    if (typeof response !== 'undefined' && !(response == 'true' || response == true || response.answer || response.answer == 'true' || response.answer == true))
                        continue;
                }
            } else {
                if (taskTabConfigGr.visibility && !GlideFilter.checkRecord(tableGr, taskTabConfigGr.visibility)) {
                    continue;
                }
            }
            var tabObj = {};
            tabObj.order = taskTabConfigGr.getDisplayValue('order');
            tabObj.name = taskTabConfigGr.getDisplayValue('name');
            tabObj.tabSysId = taskTabConfigGr.getUniqueValue();
            this._getTableNameAndSysId(taskTabConfigGr, record, tableGr, tabObj);
            this._fetchWidget(record, taskTabConfigGr, tabObj, tableGr);
            tabs.push(tabObj);
        }
        secondaryInfo.tabs = tabs;
        secondaryInfo.table = record.taskConfigGr.getDisplayValue('table');
        secondaryInfo.sysId = record.parentTableGr.getUniqueValue();
        return secondaryInfo;
    },
    _getTableNameAndSysId: function(taskTabConfigGr, record, tableGr, tabObj) {
        if (((taskTabConfigGr.type == 'activity') || (taskTabConfigGr.type == 'attachments')) && (taskTabConfigGr.source == 'approval')) {
            tabObj.parentTable = record.taskConfigGr.getDisplayValue('table');
            tabObj.sysId = record.parentTableGr.getUniqueValue();
        } else {
            tabObj.parentTable = tableGr.getTableName();
            tabObj.sysId = tableGr.getUniqueValue();
        }
    },

    _evaluateScript: function(taskTabConfigGr, tableGr, field) {
        var data = {};
        var evaluator = new GlideScopedEvaluator();
        evaluator.putVariable('current', tableGr);
        var response = evaluator.evaluateScript(taskTabConfigGr, field);
        if (typeof response !== 'undefined' && !(response == 'true' || response == true || response.answer || response.answer == 'true' || response.answer == true))
            data = response;
        return data;
    },

    _getDataForLineWidget: function(tabObj, taskTabConfigGr, tableGr) {
        if (taskTabConfigGr.advanced == true)
            return this._evaluateScript(taskTabConfigGr, tableGr, 'multiline_script');

        var fields = taskTabConfigGr.fields.split(",");
        var referenceField = this.getReferenceField(taskTabConfigGr.child_table, tabObj.parentTable);
        var widgetData = {
            selectable: false,
            columns: fields
        };
        var records = [];

        var tableRecords = new GlideRecord(taskTabConfigGr.child_table);
        tableRecords.query(referenceField, tabObj.sysId);
        tableRecords.orderBy('created');
        tableRecords.query();
        while (tableRecords.next()) {
            if (tableRecords.canRead()) {
                var childRowData = this.getFieldsInformation(tableRecords, fields);
                var rowData = {};
                // Transform to widget input format
                childRowData.forEach(function(data) {
                    rowData[data.field] = data;
                });
                var childData = {
                    sys_id: tableRecords.getUniqueValue(),
                    rowData: rowData
                };
                records.push(childData);
            }
        }
        widgetData.lineItemsData = records;
        return widgetData;
    },

    _fetchWidget: function(record, taskTabConfigGr, tabObj, tableGr) {
        var widgetParam;
        switch (taskTabConfigGr.type.toString()) {
            case 'variable_summary':
                widgetParam = {
                    'toggle': true,
                    'hide_control': true,
                    'table': tabObj.parentTable,
                    'sys_id': tabObj.sysId
                };
                tabObj.widget = $sp.getWidget('sc-variable-summarizer', widgetParam);
                break;
            case 'variable_editor':
                widgetParam = {
                    'readonly_variable_editor': 'true',
                    'hide_container': true,
                    'table': tabObj.parentTable,
                    'sys_id': tabObj.sysId
                };
                tabObj.widget = $sp.getWidget('sp-variable-editor', widgetParam);
                break;
            case 'attachments':
                widgetParam = {
                    'record_table': tabObj.parentTable,
                    'record_id': tabObj.sysId,
                    'read_only': false
                };
                tabObj.widget = $sp.getWidget('std_ticket_attachments', widgetParam);
                break;
            case 'activity':
                widgetParam = {
                    'table': tabObj.parentTable,
                    'sys_id': tabObj.sysId,
                    btnLabel: gs.getMessage('Post'),
                    'read_only': false,
                    'rich_text_editor': true,
                    'at_mentions': true
                };
                tabObj.widget = $sp.getWidget('std_ticket_conversations', widgetParam);
                break;
            case 'multiline':
                widgetParam = {
                    'parentTable': tabObj.parentTable,
                    'recordId': tabObj.sysId,
                    'table': taskTabConfigGr.getDisplayValue('child_table'),
                    'fields': taskTabConfigGr.getDisplayValue('fields')
                };
                tabObj.widget = $sp.getWidget('task-multiline-data', widgetParam);
                break;
            case 'selectable_multiline':
                widgetParam = {
                    'lines_data': this._getDataForLineWidget(tabObj, taskTabConfigGr, tableGr)
                };
                tabObj.widget = $sp.getWidget('selectable-line-list', widgetParam);
                break;
            case 'custom':
                if (taskTabConfigGr.widget && taskTabConfigGr.widget.id) {
                    widgetParam = this._replaceMacrosInObject(record, taskTabConfigGr.widget_parameters);
                    tabObj.widget = $sp.getWidget(taskTabConfigGr.widget.id.toString(), widgetParam);
                }
                break;
            default:
                break;
        }
    },
    type: 'ApprovalHubUtilSNC'
};
