var AdaptiveMacroponentVariant = Class.create();
AdaptiveMacroponentVariant.prototype = Object.extendsObject(BuilderToolkitAPIBase, {

    TABLE: 'sys_ux_macroponent_variant',
    FIELDS: ['default_macroponent', 'variant_macroponent', 'device_type'],
    FIELD_TYPES: {
        default_macroponent: 'reference',
        variant_macroponent: 'reference',
        device_type: 'string'
    },
    DEVICES: {
        DESKTOP: "desktop",
        TABLET: "tablet",
        MOBILE: "mobile"
    },
    MACROPONENT_TYPE_VARIANT: 'edc31ae5ff0032100216ffffffffffc8',
    macroponentHandler: null,

    /**
     * @param fields {string[]}
     */
    initialize: function(fields) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, undefined, undefined, this.FIELD_TYPES);
        this.macroponentHandler = new Macroponent();
    },

    /**
     * Retrieves device adaptive variant map for a given macroponent.
     * @param {string} baseMacroponentSysId
     */
    getVariantMap: function(baseMacroponentSysId) {
        if (!baseMacroponentSysId) {
            return null;
        }

        const variants = this.getRecordsByQuery(`default_macroponent=${baseMacroponentSysId}`, 'sys_created_on', false);
        const variantMap = (variants ?? []).reduce((acc, variant) => {
            const {
                deviceType,
                variantMacroponent
            } = variant;
            acc[deviceType] = variantMacroponent;
            return acc;
        }, {
            desktop: baseMacroponentSysId
        });
        return variantMap;
    },

    /**
     * Create variant mapping record
     * @param {string} baseMacroponentSysId
     * @param {string} device
     */
    createAdaptiveVariantMapping: function(baseMacroponentSysId, device) {
        try {
            const baseMacroponent = this.macroponentHandler.getRecordById(baseMacroponentSysId);
            if (!baseMacroponent || !this.isValidVariantDeviceType(device)) {
                return null;
            }
            const variantName = `${baseMacroponent.name} - (${device.charAt(0).toUpperCase() + device.slice(1)})`;
            // create variant macroponent record
            const deviceMacroponentSysId = this.macroponentHandler.createRecord({
                name: variantName,
                category: baseMacroponent.category,
                layout: new ComponentBuilderMetadata().RESPONSIVE_DEFAULT_CONTAINER_LAYOUT,
                composition: [],
                associated_types: this.MACROPONENT_TYPE_VARIANT
            });

            // create mapping record
            return this.createRecord({
                name: `${variantName} Variant Mapping`,
                defaultMacroponent: baseMacroponent.sysId,
                variantMacroponent: deviceMacroponentSysId,
                deviceType: device
            });
        } catch (e) {
            const errMsg = `Failed to create "${device}" adaptive variant mapping for : ${baseMacroponentSysId}`;
            this._logMessage(errMsg, "Error");
            return {
                message: errMsg,
                details: e
            };
        }
    },
    /**
     * Returns macroponent record based on device type
     * @param {string} baseMacroponentSysId
     * @param {'desktop'|'tablet'|'mobile'} device
     */
    getMacroponent: function(baseMacroponentSysId, device) {
        if (device !== this.DEVICES.DESKTOP && this.isValidVariantDeviceType(device)) {
            const mcpGR = this.compileVariantMacroponent(baseMacroponentSysId, device);
            return this.macroponentHandler.getValuesFromGlideRecord(mcpGR);
        }

        return this.macroponentHandler.getRecordById(baseMacroponentSysId);
    },
    /**
     * Get existing device variants excluding the current device
     */
    fetchOtherDeviceVariants: function(baseMacroponentSysId, device) {
        if (!this.isValidDeviceType(device)) {
            return {};
        }

        const FIELDS = ['name', 'layout', 'composition', 'sysId'];
        const otherVariants = device !== this.DEVICES.DESKTOP ? {
            'desktop': this.pick(this.macroponentHandler.getRecordById(baseMacroponentSysId, false), FIELDS)
        } : {};

        const variantsMappingGR = this.getRecordsByQuery(`default_macroponent=${baseMacroponentSysId}^device_type!=${device}`, 'sys_created_on', true);
        while (variantsMappingGR && variantsMappingGR.next()) {
            if (!variantsMappingGR.variant_macroponent.nil()) {
                const _variantGR = variantsMappingGR.variant_macroponent.getRefRecord();
                const variantValues = this.macroponentHandler.getValuesFromGlideRecord(_variantGR);
                otherVariants[variantsMappingGR.device_type.toString()] = this.pick(variantValues, FIELDS);
            } else {
                this._logMessage(`"${device}"- Mapped variant record doesn't exist for base mcp: ${baseMacroponentSysId}`, "Error");
            }
        }

        return otherVariants;
    },
    /**
     * Returns macroponent and related records based on device type
     * @param {string} baseMacroponentSysId
     * @param {string} parentMacroponentSysId | null
     * @param {'desktop'|'tablet'|'mobile'} device
     */
    getVariantMacroponentAndRelatedRecords: function(baseMacroponentSysId, parentMacroponentSysId, device) {
        /**
         * @type {string | GlidRecord}
         */
        let mcp = baseMacroponentSysId;

        const isComponent = parentMacroponentSysId === null;
        // if not desktop; compile variant mcp
        if (device !== this.DEVICES.DESKTOP && this.isValidVariantDeviceType(device) && isComponent) {
            mcp = this.compileVariantMacroponent(baseMacroponentSysId, device);
        }

        const macroponentAndRelatedRecords = this.macroponentHandler
            .getMCPEditorObject(mcp, parentMacroponentSysId);

        // get existing device variants other than the current device
        const existingVariants = this.fetchOtherDeviceVariants(baseMacroponentSysId, device);

        return {
            ...macroponentAndRelatedRecords,
            adaptiveVariants: existingVariants
        };

    },
	/**
     * Returns compiled/merged macroponent by merging variant mcp onto base mcp
     * @param {string} baseMacroponentSysId
     * @param {'desktop'|'tablet'|'mobile'} device
     */
    compileVariantMacroponent: function(baseMacroponentSysId, device) {
        const variantMap = this.getVariantMap(baseMacroponentSysId);
        const variantRecordSysId = this.isValidVariantDeviceType(device) ? variantMap[device] ?? null : null;
        if (!variantRecordSysId || this.isEmpty(variantRecordSysId)) {
            this._logMessage(` Mapping or Mapped variant record doesn't exist for base mcp: ${baseMacroponentSysId}`, "Info");
            return null;
        }

        const baseMacroponentGR = this.macroponentHandler.getRecordById(baseMacroponentSysId, true);
        const variantMacroponent = this.macroponentHandler.getRecordById(variantRecordSysId, false);

        // override
        this.setFieldValues(baseMacroponentGR, {
            layout: variantMacroponent.layout ?? {},
            composition: variantMacroponent.composition ?? {}
        });

        // return merged record
        return baseMacroponentGR;

    },
    /**
     * Split composition and layout
     */
    spiltCompiledMacroponent: function(compiledMacroponent, device) {
        const variantMap = this.getVariantMap(compiledMacroponent.sysId);
        if (!this.isValidVariantDeviceType(device) || this.isEmpty(variantMap[device])) {
            this._logMessage(`"${device}" Mapping or Mapped variant record doesn't exist for base mcp: ${compiledMacroponent.sysId}`, "Error");
            return {
                baseMacroponent: compiledMacroponent, // if no variant found; return as is
                variantMacroponent: null
            };
        }
        const variantMacroponent = {
            sysId: variantMap[device],
            layout: compiledMacroponent.layout,
            composition: compiledMacroponent.composition || []
        };

        const {
            layout,
            composition,
            ...baseMacroponent
        } = compiledMacroponent;
        // Object.fromEntries(Object.entries(compiledMacroponent).filter(([key]) => !['composition', 'layout'].includes(key)));
        return {
            baseMacroponent,
            variantMacroponent
        };
    },
	/**
     * Returns reconstructed base macroponent and variants
     * @param {string} baseMacroponentSysId
     * @param {object} adaptiveVariants
     * @param {'desktop'|'tablet'|'mobile'} device
     */
    reconstructMacroponents: function(compiledMacroponent, adaptiveVariants, device) {

        if (!this.isValidDeviceType(device)) {
			// return as is
            return {
				baseMacroponent: compiledMacroponent,
				variantMacroponents: {}
			};
        }

        const {
            baseMacroponent,
            variantMacroponent
        } = this.spiltCompiledMacroponent(compiledMacroponent, device);

        let variantMacroponents = {
            ...adaptiveVariants
        };


        // if device is other than desktop;
        if (!this.isEmpty(variantMacroponent) && !this.isEmpty(adaptiveVariants[this.DEVICES.DESKTOP])) {
            // set the base/desktop mcp layout and comp from variant map
            baseMacroponent.composition = adaptiveVariants[this.DEVICES.DESKTOP].composition || [];
            baseMacroponent.layout = adaptiveVariants[this.DEVICES.DESKTOP].layout;
			
			// set the variants (not desktop & not current device variant)
            const otherVariantDevice = Object.values(this.DEVICES).filter(d => d !== this.DEVICES.DESKTOP && d !== device)[0];
            const otherVariant = adaptiveVariants[otherVariantDevice] ?? {};

            variantMacroponents = {
                [device]: variantMacroponent, // current device variant 
                [otherVariantDevice]: otherVariant
            };
        }


        return {
            baseMacroponent,
            variantMacroponents
        };
    },
	/**
     * Updates variant mcp reccords
	 * 
     */
    updateVariants: function(variantMacroponents) {
		// @todo [FUTURE | PERF] save only if dirty
        return Object.entries(variantMacroponents).reduce(
            (acc, [device, variantMcp]) => {
                if (this.isEmpty(variantMcp)) {
                    return acc;
                }
                return {
                    ...acc,
                    ...({
                        [device]: this.macroponentHandler.updateRecord(variantMcp)
                    })
                };
            }, {}
        );
    },
    /**
     * Delete adaptive variant records and respective mappings
     * for a macroponent
     */
    deleteVariantsAndMapping: function(baseMacroponentSysId, device) {
        const variantMap = this.getVariantMap(baseMacroponentSysId);
        const delFns = [];

        let variants = Object.keys(variantMap);
        let mappingQuery = `default_macroponent=${baseMacroponentSysId}`;

        if (!this.isEmpty(device)) {
            variants = [device];
            mappingQuery = mappingQuery + `^device_type=${device}`;
        }

        for (const _device of variants) {
            if (_device != this.DEVICES.DESKTOP) {
                delFns.push({
                    handler: this.macroponentHandler,
                    records: [{
                        sysId: variantMap[_device]
                    }]
                });
            }
        }

        // delete variant macroponents
        this.executeDeleteFunctions(delFns);

        // delete mapping records
        this.deleteRecordsByEncodedQuery(mappingQuery);
    },
    /**
     * Delete adaptive device variant record and mapping
     * for a given macroponent
     */
    deleteVariantByDevice: function(baseMacroponentSysId, device) {
        if (this.isEmpty(device) || !this.isValidDeviceType(device)) {
            return;
        }
        if (device == this.DEVICES.DESKTOP) {
            this._logMessage(`Base variant deletion not supported! Delete the component from component settings.`, "Error");
            return;
        }
        this.deleteVariantsAndMapping(baseMacroponentSysId, device);

    },
    /**
     * Check if variant mapping / variant exists
     */
    checkIfExisting: function(baseMacroponentSysId, device) {
        const variantMap = this.getVariantMap(baseMacroponentSysId);
        if (device) {
            return !this.isEmpty(variantMap[device]);
        }

        return Object.keys(variantMap).length > 1;
    },
    /**
     * Validates variant device type
     * Note: desktop (base) is not considered as a variant
     */
    isValidVariantDeviceType: function(device) {
        const isValid = [this.DEVICES.MOBILE, this.DEVICES.TABLET].includes(device);
        if (!isValid) {
            this._logMessage(`"${device}": Invalid variant device Type!`, "Error");
        }
        return isValid;
    },
    /**
     * Validates device type
     */
    isValidDeviceType: function(device) {
        const isValid = [this.DEVICES.MOBILE, this.DEVICES.TABLET, this.DEVICES.DESKTOP].includes(device);
        if (!isValid) {
            this._logMessage(`"${device}": Invalid device Type!`, "Error");
        }
        return isValid;
    },
    /**
     * Finds if an object/string/array is empty or not.
     * Returns true or false;
     */
    isEmpty: function(value) {
        return (
            value == null ||
            (typeof value === 'object' && Object.keys(value).length === 0) ||
            (typeof value === 'string' && value.trim().length === 0)
        );
    },
    /**
     * Creates an object composed of the picked object properties.
     * @param {Object} obj - The source object
     * @param {...(string|string[])} [paths] - The property paths to pick
     */
    pick: function(obj, ...paths) {
        if (!obj || typeof obj !== 'object') return {};

        return paths.flat().reduce((result, path) => {
            if (Object.prototype.hasOwnProperty.call(obj, path)) {
                result[path] = obj[path];
            }
            return result;
        }, {});
    },
    _logMessage: function(message, type = "Info") {
        gs.info("[AdaptiveMacroponentVariantHandler][{0}]: {1} - {2}", [new GlideDateTime().getNumericValue(), type, message]);
    },

    type: 'AdaptiveMacroponentVariant'
});
