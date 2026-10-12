const UXEvent = Class.create();
UXEvent.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_event',
    FIELDS: ['label', 'event_name', 'props', 'description', 'schema_version'],
    FIELD_TYPES: {
        label: 'translated_field',
        event_name: 'string',
        props: 'json',
        description: 'translated_text',
        schema_version: 'string'
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, undefined, undefined, this.FIELD_TYPES);
    },

    /**
     * Copies the relay events for a macroponent and returns a map of old sysId to new sysId
     * @param previousMacroponentId {string} the sys_id of the macroponent we are copying from
     * @param macroponent {recordValues} the macroponent the events relate to
     * @param scope {sys_id} the sys_id of the scope we are copying into
     * 
     * @returns {sysIds: { [key: string]: string }, names: { [key: string]: string } }
     */
    copyRelayRecords: function(previousMacroponentId, macroponent, scope) {
        const returnMap = {
            sysIds: {},
            names: {}
        };
        const relayRecords = this.getRecordsByQuery(`sys_idIN${macroponent.dispatchedEvents}^event_nameLIKE${previousMacroponentId}`, 'name', true);
        while (relayRecords !== false && relayRecords.next()) {
            const currentSysId = relayRecords.getUniqueValue();
            const currentName = `${relayRecords.sys_scope.scope.toString()}.${relayRecords.getValue('event_name')}`;
            relayRecords.setValue('event_name', relayRecords.getValue('event_name').replace(previousMacroponentId, macroponent.sysId));
            if (scope) {
                relayRecords.setValue('sys_scope', scope);
            }
            const newSysId = relayRecords.insert()
            returnMap.sysIds[currentSysId] = newSysId;
            returnMap.names[currentName] = `${relayRecords.sys_scope.scope.toString()}.${relayRecords.getValue('event_name')}`;
        }
        return returnMap;
    },

    /**
     * Creates any net new event, updates existing ones, deletes removed ones, and updates MCP dispatched/handled event fields
     * @param events {object[]} an array of sys_ux_event objects
     * @param macroponent {Macroponent} the macroponent the events relate to
     */
    upsertAndDeleteRecords: function(events = [], macroponent = null) {
        // If we have no macroponent or events, we shouldn't be here so ABORT
        if (!macroponent?.sysId || !events) {
            return {};
        }
        const that = this;
        let updatedDispatchedEvents = (macroponent?.dispatchedEvents?.split(',') ?? []);
        let updatedHandledEvents = (macroponent?.handledEvents?.split(',') ?? []);
        let results = events.reduce((acc, fields) => {
            // Check if this sysId already exists OR if the event name exists within the same scope
            const query = `sys_id=${fields?.sysId}^NQevent_name=${fields?.eventName}^sys_scope=${fields?.sysScope?.value}`;
            const eventGR = that.getRecordsByQuery(query, '', true);
            // If it doesn't exist, then we just create it and remove from our list
            if (!eventGR) {
                acc.push(that.createRecord(fields));
            } else if (eventGR.next()) {
                // If we already exist, write if we can, and then make sure our dispatched/handled events are correct
                if (eventGR.canWrite()) {
                    const currentFieldValues = eventGR.getElements().reduce(that.getFieldValues.bind(that), {});
                    // Let's compare our field values to make sure we don't update needlessly
                    // If we don't match values, update the record and return the result
                    for (const field in fields) {
                        if (eventGR.isValidField(field) && currentFieldValues[field] !== fields[field]) {
                            const {
                                sysId,
                                ...eventFields
                            } = fields;
                            that.setFieldValues(eventGR, eventFields);
                            acc.push(eventGR.update());
                            break;
                        }
                    }
                }

                const dispatchedIndex = updatedDispatchedEvents.findIndex((sysId) => sysId === fields?.sysId);
                dispatchedIndex !== -1 ? updatedDispatchedEvents.splice(dispatchedIndex, 1, eventGR.getUniqueValue()) :
                    updatedDispatchedEvents;

                const handledIndex = updatedHandledEvents.findIndex((sysId) => sysId === fields?.sysId);
                handledIndex !== -1 ? updatedHandledEvents.splice(handledIndex, 1, eventGR.getUniqueValue()) :
                    updatedHandledEvents;
            }
            return acc;
        }, []);

        // Now if we have any events the macroponent is pointed at that we don't have anymore
        // we should try to delete them
        const macroponentGR = new Macroponent().getRecordById(macroponent?.sysId, true);
        if (macroponentGR) {
            const previousEventIds = [
                ...(macroponentGR.getValue('dispatched_events')?.split(',') ?? []),
                ...(macroponentGR.getValue('handled_events')?.split(',') ?? [])
            ];
            const updatedEventIds = [...updatedDispatchedEvents, ...updatedHandledEvents];
            const eventsIdsToDelete = previousEventIds.filter((eventId) => !updatedEventIds.includes(eventId));
            const eventsToDelete = eventsIdsToDelete.reduce((acc, eventId) => {
                acc.push({
                    sysId: eventId
                });
                return acc;
            }, []);
            results = results.concat(that.deleteRecords(eventsToDelete, macroponent.sysId));
        }

        return {
            updatedDispatchedEvents,
            updatedHandledEvents,
            eventOperationResults: results
        };
    },

    /**
     * @param records {array} an array of event records
     * @param macroponentSysId {string} sys_id of the macroponent this event is related to
     */
    deleteRecords: function(records, macroponentSysId) {
        const that = this;
        return records.reduce((acc, fields) => {
            // We have to check if this event is in use anywhere else so we don't delete when used elsewhere
            const mcpQuery = `handled_eventsLIKE${fields?.sysId}^handled_eventsISNOTEMPTY^sys_id!=${macroponentSysId}^NQdispatched_eventsLIKE${fields?.sysId}^dispatched_eventsISNOTEMPTY^sys_id!=${macroponentSysId}`;
            const macroponentUsage = new Macroponent().checkIfRecordsExist(mcpQuery, '', true);
            const addOnEventMappingUsage = new UXAddOnEventMapping().checkIfRecordsExist(`target_event=${fields?.sysId}^target_eventISNOTEMPTY^parent_macroponent!=${macroponentSysId}`, '', true);
            if (!macroponentUsage && !addOnEventMappingUsage) {
                // We also have to check that the event actually exists, it might be something deleted before it was saved
                const eventGR = that.getRecordById(fields?.sysId, true);
                if (eventGR) {
                    acc.push(eventGR.deleteRecord(fields));
                }
            }
            return acc;
        }, []);
    },

    type: 'UXEvent'
});
