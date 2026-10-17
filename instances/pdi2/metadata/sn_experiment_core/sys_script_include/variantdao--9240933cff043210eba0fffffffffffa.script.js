var VariantDao = Class.create();
VariantDao.prototype = {
    initialize: function() {
        this.TABLE_NAME = 'sn_experiment_core_variant';
    },

    getVariantsByParentId: function(parentId) {
        if (!parentId) {
            gs.warn('VariantDao.getVariantsByParentId: parentId is required');
            return [];
        }

        var variants = [];
        var gr = new GlideRecord(this.TABLE_NAME);
        gr.addQuery('parent_id', parentId);
        gr.orderBy('name');
        gr.query();

        while (gr.next()) {
            var variant = new Variant().initializeWithGr(gr);
            if (variant) {
                variants.push(variant);
            }
        }

        return variants;
    },

    saveVariant: function(variant) {
        if (!variant || typeof variant !== 'object') {
            gs.error('VariantDao.saveVariant: Valid Variant object is required');
            return null;
        }

        try {
            var gr = new GlideRecord(this.TABLE_NAME);
            var variantId = variant.getVariantId();
            var isUpdate = gr.get(variantId);

            if (!isUpdate) {
                gr.initialize();
                if (variantId) gr.setNewGuidValue(variantId);
            }

            gr.setValue('parent_id', variant.getParentId());
            gr.setValue('parent_table', variant.getParentTable());
            gr.setValue('name', variant.getName());
            gr.setValue('description', variant.getDescription());
            gr.setValue('percentage', variant.getPercentage());
            gr.setValue('value', variant.getValue());
			gr.setValue('default_variant',variant.isDefaultVariant());

            var savedSysId = gr.update();
            return savedSysId || gr.getUniqueValue();
        } catch (error) {
            gs.error('VariantDao.saveVariant: ' + error.message);
            return null;
        }
    },

    type: 'VariantDao'
};
