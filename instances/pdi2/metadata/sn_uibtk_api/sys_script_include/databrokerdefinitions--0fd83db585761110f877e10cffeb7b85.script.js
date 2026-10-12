const DataBrokerDefinitions = Class.create();
DataBrokerDefinitions.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_data_broker',
    FIELDS: ['acl_failure_result', 'api_name', 'api_url', 'data_drivers', 'description', 'http_method', 'macroponent', 'mutates_server_data', 'name', 'operations', 'output_properties', 'output_schema', 'parameters', 'private', 'props', 'query', 'request_body', 'required_translations', 'restricted_to_single_instance', 'schema_version', 'script', 'sys_id', 'sys_policy', 'type'],
    FIELD_TYPES: {
        api_name: 'string',
        api_url: 'string',
        description: 'string',
        http_method: 'string',
        macroponent: 'reference',
        mutates_server_data: 'boolean',
        name: 'string',
        output_properties: 'json',
        output_schema: 'json',
        parameters: 'json',
        private: 'boolean',
        props: 'json',
        query: 'string',
        request_body: 'string',
        required_translations: 'json',
        restricted_to_single_instance: 'boolean',
        schema_version: 'string',
        script: 'string',
        type: 'string'
    },
    TYPE_MAP: {
        sys_ux_data_broker_graphql: 'GRAPHQL',
        sys_ux_data_broker_transform: 'TRANSFORM',
        sys_ux_data_broker_proxy: 'CLIENT_STATE',
        sys_ux_data_broker_composite: 'COMPOSITE',
        sys_ux_data_broker_rest: 'REST',
        sys_ux_data_broker_scriptlet: 'SCRIPTLET',
        sys_ux_controller: 'CONTROLLER'
    },
    TABLES: ['sys_ux_data_broker_graphql', 'sys_ux_data_broker_transform', 'sys_ux_data_broker_proxy', 'sys_ux_data_broker_composite', 'sys_ux_data_broker_rest', 'sys_ux_data_broker_scriptlet'],

    /**
     * @param table {string} because we have child tables, we need to support pulling directly from a child
     * @param fields {string[]}
     */
    initialize: function(table = null, fields = null) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, table ?? this.TABLE, fields ?? this.FIELDS, undefined, undefined, this.FIELD_TYPES);
    },

    /**
     * Overrides parent class function to inject special fields
     * @param acc {object} the accumulator object
     * @param field {GlideElement} the field element we are currently working on
     */
    getFieldValues: function(acc, field) {
        acc = BuilderToolkitAPIBase.prototype.getFieldValues.call(this, acc, field);
        if (field.nil()) {
            return acc;
        }
        const fieldName = field.getName();
        if (fieldName === 'sys_class_name') {
            acc['type'] = this.TYPE_MAP[field] ?? 'UNKNOWN';
        } else if (fieldName === 'macroponent' && field) {
            const macroponent = field.getRefRecord();
            acc['macroponent'] = new Macroponent().getRecordById(macroponent.getUniqueValue());
            acc['clientStateDataBrokerTagName'] = macroponent.root_component.getDisplayValue();
        } else if (fieldName === 'schema_version' && this.fields.indexOf('schema_version') !== -1) {
            acc['schemaVersion'] = field ?? '1.0.0';
        }
        return acc;
    },

    /**
     * @param recordGR {GlideRecord} the record we want to get values for
     */
    getValuesFromGlideRecord: function(recordGR, noChildTableCheck = false) {
        if (!noChildTableCheck && recordGR.sys_class_name.toString() === this.TABLE) {
            const childTableGR = this.getSecure(recordGR.sys_class_name.toString(), 'sys_id=' + recordGR.getUniqueValue());
            childTableGR.next();
            return {
                ...childTableGR.getElements().reduce(this.getFieldValues.bind(this), {}),
                private: childTableGR.private.getDisplayValue() === 'true'
            };
        } else {
            const fieldValues = recordGR.getElements().reduce(this.getFieldValues.bind(this), {});
            return noChildTableCheck ? fieldValues : {
                ...fieldValues,
                private: recordGR.private.getDisplayValue() === 'true'
            };
        }
    },

    // Gets basic DB defs without diving into child tables
    getBasicDataBrokerDefinitions: function() {
        const dataBrokerDefinitions = {};

        const complexDataBrokerDefinitionGR = this.getRecordsByQuery('', '', true);
        while (complexDataBrokerDefinitionGR.next()) {
            const dbDefValues = this.getValuesFromGlideRecord(complexDataBrokerDefinitionGR, true);
            dataBrokerDefinitions[dbDefValues.sysId] = dbDefValues;
        }
        return dataBrokerDefinitions;
    },

    /**
     * Gets all data broker definitions and their event definitions by table to save extra queries
     */
    getDatabrokerDefinitions: function(sysIds) {
        const query = sysIds ? `sys_idIN${sysIds}` : '';
        const dataBrokerDefinitionArr = this.TABLES.reduce((acc, table) => {
            const allRecordsForTable = new DataBrokerDefinitions(table).getRecordsByQuery(query, 'name');
            if (allRecordsForTable) {
                return acc.concat(allRecordsForTable);
            }
            return acc;
        }, []);
        const dataBrokerDefinitions = dataBrokerDefinitionArr.reduce((acc, definition) => {
            acc[definition.sysId] = definition;
            return acc;
        }, {});
        const allEventIds = dataBrokerDefinitionArr.filter((definition) => definition?.macroponent)
            .reduce((acc, {
                macroponent
            }) => {
                return acc.concat(macroponent?.handledEvents?.split(',') ?? [], macroponent?.dispatchedEvents?.split(',') ?? []);
            }, []);
        const dataBrokerOperationEventQuery = this.getDataBrokerOperationsEventQuery(dataBrokerDefinitions);
        // Get all of the events and operation events (do a new query for operation events)
        const eventDefinitionRecords = new UXEvent().getRecordsByQuery(`sys_idIN${allEventIds}${dataBrokerOperationEventQuery.replace('^OR', '^NQ')}`, '');
        const dbEventDefinitions = eventDefinitionRecords ? eventDefinitionRecords : [];
        const eventDefinitions = [...dbEventDefinitions, ...this.getMutationDataBrokerDispatchedEvents(), ...this.getRegularDataBrokerDispatchedEvents()];
        return {
            dataBrokerDefinitions,
            eventDefinitions
        };
    },

    /**
     * @param macroponentGR {GlideRecord} the macroponent we are getting the Data field from
     */
    getDataBrokerDefinitionIds: function(macroponentGR) {
        if (!macroponentGR.data.nil()) {
            const data = this.parseJSON(macroponentGR.data, {
                sysId: macroponentGR.sysId || macroponentGR.getUniqueValue(),
                field: 'data'
            });
            if (Array.isArray(data)) {
                return data.map(function(broker) {
                    return broker.definition.id;
                });
            }
        }
        return [];
    },

    /**
     * @oaram dataBrokerDefinitions {object} the object containing all dataBrokerDefinitions
     */
    getDataBrokerOperationsEventQuery: function(dataBrokerDefinitions) {
        const dataBrokerDefinitionOperationEventNameQuery = Object.values(dataBrokerDefinitions)?.filter((definition) => definition?.operations)
            .reduce((acc, {
                operations
            }) => {
                return acc.concat(operations.filter((operation) => operation?.delegate).map(({
                    delegate
                }) => {
                    // Pattern should be scope_name.event_name and we should trim the trailing comma if one is present
                    const apiName = (delegate?.handledEventApiName ?? '').replace(',', '').split('.');
                    // return the query or an empty string if the pattern is wrong
                    return apiName.length > 1 ?
                        `^ORsys_scope.scope=${apiName[0]}^event_name=${apiName[1]}` :
                        '';
                }));
            }, []);
        return dataBrokerDefinitionOperationEventNameQuery.join('');
    },

    /**
     * @param macroponentGR {GlideRecord} the macroponent we are getting the Data field from
     * @param contextState {object} the parent and ancestor contextState fields
     */
    getMacroponentDataBrokerDefinitions: function(macroponentGR, contextState) {
        let anscestorDataBrokerIds = (contextState?.ancestor?.data ?? []).map(({
            definition
        }) => definition?.id);
        const parentBrokerIds = (contextState?.parent?.data ?? []).map(({
            definition
        }) => definition?.id);
        if (contextState?.upstreamMacroponents) {
            let ancestorData = [];
            Object.values(contextState.upstreamMacroponents ?? []).forEach(
                (upstreamMCP) => {
                    ancestorData = ancestorData.concat(upstreamMCP?.data ?? []);
                }
            );
            anscestorDataBrokerIds = ancestorData.map(({
                definition
            }) => definition.id);
        }

        const localBrokerIds = this.getDataBrokerDefinitionIds(macroponentGR);
        const allBrokerIds = [...localBrokerIds, ...parentBrokerIds, ...anscestorDataBrokerIds];
        const {
            dataBrokerDefinitions
        } = this.getDatabrokerDefinitions(allBrokerIds);
        return dataBrokerDefinitions;
    },

    getMutationDataBrokerDispatchedEvents: function() {
        const dataElementProp = this.getDataElementProp();
        return [{
                sysId: 'DATA_FETCH_INITIATED',
                eventName: 'DATA_FETCH_INITIATED',
                label: gs.getMessage('Data Fetch Initiated'),
                props: [dataElementProp]
            },
            {
                sysId: 'DATA_FETCH_SUCCEEDED',
                eventName: 'DATA_FETCH_SUCCEEDED',
                label: gs.getMessage('Data Fetch Succeeded'),
                props: [dataElementProp]
            },
            {
                sysId: 'DATA_FETCH_FAILED',
                eventName: 'DATA_FETCH_FAILED',
                label: gs.getMessage('Data Fetch Failed'),
                props: [dataElementProp, this.getErrorProp()]
            }
        ];
    },

    getRegularDataBrokerDispatchedEvents: function() {
        const dataElementProp = this.getDataElementProp();
        const operationProp = this.getOperationProp();
        return [{
                sysId: 'DATA_OP_INITIATED',
                eventName: 'DATA_OP_INITIATED',
                label: gs.getMessage('Operation Initiated'),
                props: [dataElementProp, operationProp]
            },
            {
                sysId: 'DATA_OP_SUCCEEDED',
                eventName: 'DATA_OP_SUCCEEDED',
                label: gs.getMessage('Operation Succeeded'),
                props: [dataElementProp, operationProp]
            },
            {
                sysId: 'DATA_OP_FAILED',
                eventName: 'DATA_OP_FAILED',
                label: gs.getMessage('Operation Failed'),
                props: [dataElementProp, operationProp, this.getErrorProp()]
            }
        ];
    },

    getDataElementProp: function() {
        return {
            name: 'dataElemId',
            label: gs.getMessage('Data Element ID'),
            valueType: 'string'
        };
    },

    getOperationProp: function() {
        return {
            name: 'operation',
            label: gs.getMessage('Operation'),
            valueType: 'string'
        };
    },

    getErrorProp: function() {
        return {
            name: 'errors',
            label: gs.getMessage('Errors'),
            valueType: 'json'
        };
    },

    type: 'DataBrokerDefinitions'
});
