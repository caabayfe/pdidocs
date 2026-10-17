const VersionsHandler = Class.create();
VersionsHandler.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_update_version',
    FIELDS: ['name', 'payload', 'sys_created_on', 'sys_created_by'],

    initialize: function() {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, this.FIELDS);
        this.TIMESTAMPS = [];
        this.SCRIPT_IDS = [];
        this.EVENT_IDS = [];
    },

    getPageVersionSnapshots: function(screenSysId, macroponentSysId) {
        const versionSnapshots = [];
        const { mcpVersions, screenVersions } = this.getMacroponetAndScreenVersions(macroponentSysId, screenSysId);

        // Extract client script sysIds from all the macroponent versions
        mcpVersions.forEach((v) => this.processMcpVersion(v));

        const clientScriptsVersions = this.getClientScriptsVersions(macroponentSysId);

        const eventsVersions = this.getEventsVersions();

        // Sort all the timestamps in ascending order
        this.TIMESTAMPS = this.TIMESTAMPS.map(
          (ts) => new GlideDateTime(ts)
        ).sort((t1, t2) => {
          return t1.getNumericValue() - t2.getNumericValue();
        });

        this.TIMESTAMPS = this.collapseDateTimeJitter(this.TIMESTAMPS);

        for (const ts of this.TIMESTAMPS) {
            const pageModelVersion = {
                macroponent: null,
                screen: null,
                clientScripts: {},
                events: {},
                timestamp: ts.getValue()
            };

            const snapshotVersions = [];

            const mcp = this.findLast(mcpVersions, (v) =>
                v && v.timestamp.onOrBefore(ts)
            );
            pageModelVersion.macroponent = !mcp || mcp.action === 'DELETE' ? null : mcp.versionId;
            mcp && snapshotVersions.push(mcp);

            const screen = this.findLast(screenVersions, (v) =>
                v && v.timestamp.onOrBefore(ts)
            );
            pageModelVersion.screen = !screen || screen.action === 'DELETE' ? null : screen.versionId;
            screen && snapshotVersions.push(screen);

            pageModelVersion.clientScripts = Object.entries(
                clientScriptsVersions
            ).reduce((acc, [k, vs]) => {
                const cs = this.findLast(vs, (v) => v && v.timestamp.onOrBefore(ts));
                cs && snapshotVersions.push(cs);
                return !cs || cs.action === 'DELETE' ?
                    acc : {
                        ...acc,
                        [k]: cs.versionId
                    };
            }, {});

            pageModelVersion.events = Object.entries(
                eventsVersions
            ).reduce((acc, [k, vs]) => {
                const ev = this.findLast(vs, (v) => v && v.timestamp.onOrBefore(ts));
                ev && snapshotVersions.push(ev);
                return !ev || ev.action === 'DELETE' ?
                    acc : {
                        ...acc,
                        [k]: ev.versionId
                    };
            }, {});

            // get the latest version from all the available versions in a given snapshot
            const latestVersion = this.findLatestVersion(snapshotVersions);
            pageModelVersion.createdBy = latestVersion?.createdBy || 'system';
            versionSnapshots.push(pageModelVersion);
        }

        return versionSnapshots.reverse();
    },

    getComponentVersionSnapshots: function() {
        /* placeholder */
    },

    getControllerVersionSnapshots: function() {
        /* placeholder */
    },

    getPresetVersionSnapshots: function() {
        /* placeholder */
    },

    getRecordVersionSnapshots: function() {
        /* placeholder */
    },

    parseVersions: function(versionIds) {
        if (!versionIds) {
            return {};
        }
        const encodedQuery = `sys_idIN${versionIds}`;
        const versions = this.getVersions(encodedQuery);

        return versions.reduce((acc, v) => {
            acc[v.versionId] = v.payload;
            return acc;
        }, {});
    },

    getClientScriptsVersions: function(macroponentSysId) {
        // Get all the client scripts related to the current macroponent
        const scriptsGr = this.getRecords('sys_ux_client_script', `macroponent=${macroponentSysId}`);

        // Store the current macroponent's active client script ids to the SCRIPT_IDS
        while (scriptsGr.next()) {
            this.addScriptSysId(scriptsGr.getUniqueValue());
        }

        let scriptsVersions = [];
        if (this.SCRIPT_IDS.length > 0) {
            // Get the versions for all the clients across all the given macroponent versions
            scriptsVersions = this.getVersions(
                `nameIN${this.SCRIPT_IDS.map((id) => `sys_ux_client_script_${id}`).join(',')}`
            );
        }

        return this.groupScriptVersionsById(scriptsVersions);
    },

    getEventsVersions: function() {
        let eventsVersions = [];
        if (this.EVENT_IDS.length > 0) {
            // Get the versions for all the events across all the given macroponent versions
            eventsVersions = this.getVersions(
                `nameIN${this.EVENT_IDS.map((id) => `sys_ux_event_${id}`).join(',')}`
            );
        }

        return this.groupEventVersionsById(eventsVersions);
    },

    groupEventVersionsById: function(versions) {
        const grouped = {};
        for (let v of versions) {
            if (!grouped[v.payload.sysId]) {
                grouped[v.payload.sysId] = [];
            }
            grouped[v.payload.sysId].push(v);
        }
        return grouped;
    },

    getMacroponetAndScreenVersions: function(macroponentSysId, screenSysId) {
        const query = `nameINsys_ux_macroponent_${macroponentSysId},sys_ux_screen_${screenSysId}`;
        const allVersions = this.getVersions(query);
        return allVersions.reduce((acc, version) => {
            if (version?.name?.startsWith('sys_ux_macroponent')) {
                acc.mcpVersions.push(version);
            } else if (version?.name?.startsWith('sys_ux_screen')) {
                acc.screenVersions.push(version);
            }
            return acc;
        }, {mcpVersions: [], screenVersions: []});
    },

    getVersions: function(encodedQuery) {
        const versions = [];
        const versionsGr = this.getRecords(this.table, encodedQuery);

        while (versionsGr.next()) {
            const createdOn = versionsGr.getDisplayValue('sys_created_on');
            const createdBy = versionsGr.getDisplayValue('sys_created_by');
            const versionPayload = versionsGr.getValue('payload');
            const versionName = versionsGr.getValue('name');

            const {
                action,
                payload
            } = this.getPayloadAsUIBJson(versionPayload);

            versions.push(
                this.createVersion(
                    versionName,
                    versionsGr.getUniqueValue(),
                    payload,
                    new GlideDateTime(createdOn),
                    createdBy,
                    action
                )
            );

            this.addTimestamp(createdOn);
        }

        return versions;
    },

    createVersion: function(name, versionId, payload, timestamp, createdBy, action) {
        return {
            name,
            versionId,
            payload,
            timestamp,
            createdBy,
            action
        };
    },

    getPayloadAsUIBJson: function(versionPayload) {
        const jsonPayload = gs.xmlToJSON(versionPayload);
        const tableName = jsonPayload.record_update?.table;

        if (!tableName) {
            this._log(`Did not find the record for table ${table} in the payload:\n${versionPayload}`);
            return null;
        }

        const {
            action,
            ...recordInfo
        } = jsonPayload.record_update[tableName];

        const fakeGR = new GlideRecord(tableName);
        for (const field in recordInfo) {
            if (field === 'sys_id' || field === 'sys_scope' || field === 'sys_mod_count') {
                continue;
            }

            if (typeof recordInfo[field] === 'object' && 'display_value' in recordInfo[field]) {
                fakeGR[field] = recordInfo[field].content;
            } else {
                fakeGR[field] = recordInfo[field];
            }
        }

        const values = new BuilderToolkitAPIBase(tableName).getValuesFromGlideRecord(
            fakeGR
        );

        return {
            action: action,
            payload: {
                ...values,
                sysId: recordInfo.sys_id
            }
        };
    },

    addTimestamp: function(ts) {
        if (this.TIMESTAMPS.includes(ts)) {
            return;
        }
        this.TIMESTAMPS.push(ts);
    },

    addScriptSysId: function(sysId) {
        if (!sysId || this.SCRIPT_IDS.includes(sysId)) {
            return;
        }
        this.SCRIPT_IDS.push(sysId);
    },

    addEventSysId: function(sysId) {
        if (!sysId || this.EVENT_IDS.includes(sysId)) {
            return;
        }
        this.EVENT_IDS.push(sysId);
    },

    processComposition(composition) {
        composition.forEach((el) => {
            this.processElementProps(el);
            this.processElementEventMappings(el);
            if (el.overrides?.composition) {
                this.processComposition(el.overrides.composition);
            }
            if (el.conditionals) {
                const conditionalsComposition = el.conditionals.map((conditional) => conditional.item);
                this.processComposition(conditionalsComposition);
            }
        });
    },

    processElementProps: function(el) {
        // Find all CTS in UxValues in composition elements
        for (let value of Object.values(el.propertyValues ?? {})) {
            if (value?.type === 'CLIENT_TRANSFORM_SCRIPT') {
                this.addScriptSysId(value.script.scriptSysId);
            }
        }
    },

    processElementEventMappings: function(el) {
        // Find all scriptSysId fields in element event mapping targets
        for (let mapping of el.eventMappings ?? []) {
            for (let target of mapping.targets ?? []) {
                if (target.clientScript) {
                    this.addScriptSysId(target.clientScript.sysId);
                }
            }
        }
    },

    processDataResource: function(dr) {
        for (let mapping of dr.eventMappings ?? []) {
            for (let target of mapping.targets ?? []) {
                if (target.clientScript) {
                    this.addScriptSysId(target.clientScript.sysId);
                }
            }
        }
    },

    processPageEventMapping: function(em) {
        if (em.clientScript) {
            this.addScriptSysId(em.clientScript.sysId);
        }
    },

    processMcpVersion: function(mcpVersion) {
        const mcp = mcpVersion.payload;
        const mcpComposition = mcp.composition || [];
        const mcpData = mcp.data || [];
        const mcpEventMappings = mcp.internalEventMappings ?? {};
        const handledEvents = mcp.handledEvents?.split(',') || [];
        const dispatchedEvents = mcp.dispatchedEvents?.split(',') || [];
        [...handledEvents, ...dispatchedEvents].forEach((eventId) => this.addEventSysId(eventId));

        this.processComposition(mcpComposition);
        // Find all scriptSysId fields in data resource event mapping targets
        for (let dr of mcpData) {
            this.processDataResource(dr);
        }
        // Find all scriptSysId fields in page level event mapping targets
        for (let mapping of Object.values(mcpEventMappings).flat()) {
            this.processPageEventMapping(mapping);
        }
    },

    groupScriptVersionsById: function(versions) {
        const grouped = {};
        for (let v of versions) {
            if (!grouped[v.payload.sysId]) {
                grouped[v.payload.sysId] = [];
            }
            grouped[v.payload.sysId].push(v);
        }
        return grouped;
    },

    collapseJitter: function(values, comparisonFn) {
        let i = 0;
        let begining = null;
        let top = null;
        let jitterFree = [];
        while (i < values.length) {
            if (!begining) {
                begining = values[i];
            }
            if (comparisonFn(begining, values[i])) {
                top = values[i];
                i++;
            } else {
                if (top == null) {
                    top = begining;
                }
                values.splice(0, i);
                jitterFree.push(top);
                begining = null;
                top = null;
                i = 0;
            }
            if (i >= values.length && values.length == 1) {
                jitterFree.push(values[0]);
                break;
            } else if (i >= values.length) {
                jitterFree.push(top);
                break;
            }
        }
        return jitterFree;
    },

    collapseDateTimeJitter: function(dateTimes) {
        return this.collapseJitter(dateTimes, this.compareDateTimes);
    },

    compareDateTimes: function(lower, dt) {
        let gdt = new GlideDateTime(lower);
        gdt.add(5000);
        if (dt === null) {
            return false;
        }
        return gdt.onOrAfter(dt);
    },

    findLast: function(arr, pred) {
        let last = undefined;
        for (let el of arr) {
            if (pred(el)) {
                last = el;
            } else {
                return last;
            }
        }
        return last;
    },

    findLatestVersion: function(versions) {
        versions.sort((v1, v2) => {
            return v1.timestamp.getNumericValue() - v2.timestamp.getNumericValue();
        })

        return versions.pop();
    },

    getRecords: function(table, encodedQuery, orderBy) {
        return this.get(table, encodedQuery, orderBy || 'sys_created_on');
    },

    _log: function(message) {
        gs.info("[VersionsHandler][{0}]: {1}", [new GlideDateTime().getNumericValue(), message]);
    },

    type: 'VersionsHandler'
});
