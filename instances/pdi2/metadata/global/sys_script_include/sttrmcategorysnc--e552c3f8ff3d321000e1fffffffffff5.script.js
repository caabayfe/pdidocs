var STTRMCategorySNC = Class.create();
STTRMCategorySNC.prototype = {

    initialize: function(categoryGr, _gs) {
        this._gr = categoryGr;
        this._gs = _gs;
    },

    canDelete: function() {
        if (!this._gr)
            return false;

        if (gs.nil(this._gr))
            return false;

        var modelCategoryGr = new GlideRecord("sttrm_model_sttrm_category");
        modelCategoryGr.addQuery("sttrm_category", this._gr.getUniqueValue());
        modelCategoryGr.setLimit(1);
        modelCategoryGr.query();

        if (modelCategoryGr.next())
            return false;

        var templateCategoryGr = new GlideRecord("sttrm_template_sttrm_category");
        templateCategoryGr.addQuery("sttrm_category", this._gr.getUniqueValue());
        templateCategoryGr.setLimit(1);
        templateCategoryGr.query();

        if (templateCategoryGr.next())
            return false;

        return true;
    },

    getDepth: function() {
        var depth = 1;
        var checkedSysIds = [];
        var catGr = this._gr;
        while (!catGr.parent.nil() && checkedSysIds.indexOf(catGr.getValue("parent")) === -1) {
            depth++;
            checkedSysIds.push(catGr.getUniqueValue());
            catGr = catGr.parent.getRefRecord();
        }
        return depth;
    },

    type: 'STTRMCategorySNC'
};
