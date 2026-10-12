var PDVariantRepository = Class.create();
PDVariantRepository.prototype = {
    initialize: function() {},
    type: 'PDVariantRepository',

    getVariantsByProcessDefinition: function(processDefinitionId) {
        if (!processDefinitionId)
            throw (gs.getMessage('Missing required parameter: processDefinitionId'));

        var gr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_VARIANT);
        gr.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, processDefinitionId);
        gr.query();

        var variants = [];
        while (gr.next()) {
            variants.push(this._getVariantFromGR(gr));
        }
        return variants;
    },

    insertVariant: function(fields) {
        fields = fields || {};
        var sysId = fields.sysId;

        this._throwIfMissingMandatoryFields(fields, ['processDefinition', 'label', 'order']);

        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_PROCESS_VARIANT);
        gr.initialize();

        if (sysId)
            gr.setNewGuidValue(sysId);

        PDUtils.setGlideRecordFieldsValue(fields, gr);
        var insertedVariantId = gr.insert();

        if (!insertedVariantId) {
            var errorRecordId = sysId || '';
            throw gs.getMessage('Unable to insert variant {0}: {1}', [errorRecordId, gr.getLastErrorMessage()]);
        }

		var variantLevel = this._getVariantLevel(insertedVariantId);

        var gcf_map = new GCFSampleMap();
        gcf_map.put('process_id', fields.processDefinition);
        gcf_map.put('variant_id', 0);
        gcf_map.put('level', variantLevel);

		var padGCFCollector = new PADGCFCollector();
		padGCFCollector.recordProcessUsageEventWithMap(padGCFCollector.processEvents.VARIANT_CREATED, gcf_map);

        return this._getVariantFromGR(gr);
    },

    updateVariant: function(fields) {
        fields = fields || {};

        this._throwIfMissingMandatoryFields(fields, ['sysId']);

        var sysId = fields['sysId'];
        var gr = PDUtils.newGlideRecordWithSkipProcessUpdate(PDConstants.TABLES.PD_PROCESS_VARIANT);
        var isNewFavorite = !gr.getValue(PDConstants.FIELDS) && fields.favorite;
        var variantGr = gr.get(sysId);

        if (!variantGr)
            throw (gs.getMessage('Unable to find variant with id: {0}', sysId));

        PDUtils.setGlideRecordFieldsValue(fields, gr);
        if (!gr.update())
            throw gs.getMessage('Unable to update variant {0}: {1}', [sysId, variantGr.getLastErrorMessage()]);

        if (isNewFavorite) {
            var padGCFCollector = new PADGCFCollector();
            padGCFCollector.recordProcessUsageEvent(padGCFCollector.processEvents.FAVORITE_VARIANT, 0);
        }

        var variant = this._getVariantFromGR(gr);
        return variant;
    },

    deleteVariants: function(variantIdsStr) {
        PDUtils.deleteRecordsBySysIds(variantIdsStr, PDConstants.TABLES.PD_PROCESS_VARIANT);
    },

    _getVariantFromGR: function(gr) {
        var FIELDS = PDConstants.FIELDS;

        return {
            sys_id: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_ID),
            label: PDUtils.getFieldReturnValue(gr, FIELDS.LABEL),
            condition: PDUtils.getFieldReturnValue(gr, FIELDS.CONDITION),
            process_definition: PDUtils.getFieldReturnValue(gr, FIELDS.PROCESS_DEFINITION),
            parent_variant: PDUtils.getFieldReturnValue(gr, FIELDS.PARENT_VARIANT),
            favorite: PDUtils.getFieldReturnValueInBoolean(gr, FIELDS.FAVORITE),
            color: PDUtils.getFieldReturnValue(gr, FIELDS.COLOR),
            order: PDUtils.getFieldReturnValue(gr, FIELDS.ORDER),
            designer_state: PDUtils.getFieldReturnValue(gr, FIELDS.DESIGNER_STATE),
            sys_created_on: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_CREATED_ON),
            sys_updated_on: PDUtils.getFieldReturnValue(gr, FIELDS.SYS_UPDATED_ON),
        };
    },

	_getVariantLevel: function(variantId) {
		var level = 1;
		var variant = new GlideRecord(PDConstants.TABLES.PD_PROCESS_VARIANT)
		variant.get(variantId);
		while (variant.parent_variant) {
            var parentVariant = new GlideRecord(PDConstants.TABLES.PD_PROCESS_VARIANT);
            parentVariant.get(variant.parent_variant);
            variant = parentVariant;
			level = level + 1;
        }
		return level;
	},

    _throwIfMissingMandatoryFields: function(fields, mandatoryFields) {
        var missingFields = PDUtils.findMissingFields(fields, mandatoryFields).join(", ");
        if (missingFields.length)
            throw gs.getMessage('Missing {0}', [missingFields]);
    }
};
