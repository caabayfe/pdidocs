var StdChgTemplateFilter = Class.create(GlideTemplateFilter, {

    initialize: function(name, query, fDiv, runnable, synchronous, showOperators, callback, originalQuery) {
        noSort = true;
        query = query || "";
        noGroup = true;
        noConditionals = true;
        useTextareas = true;
        filterExpanded = true;
        GlideFilter.prototype.initialize.call(this, name, query, fDiv, runnable, synchronous, callback, originalQuery);
        this.usedFields = {};
        this.protectedFields = {};
        this.fieldName = null;
        this.isTemplate = true;
        this.applyTemplateAcls = true;
        //fields to ignore. this should be passed in as an option, or ideally localized to each individual element handler like 'isTemplateable()' currently
        var fieldTypesToIgnore = [
            'variable_conditions',
            'conditions',
            'password',
            'password2',
            'encrypted_small',
            'encrypted_extra_large',
            'template_value',
            'user_image'
        ];
        this.addFieldTypesToIgnore(fieldTypesToIgnore);
        this.ignoreVariables(['variables', 'questions', 'sys_tags']);
        this.opsWanted = false;
    },

    type: 'StdChgTemplateFilter'
});
