var STTRMTemplateCopySNC = Class.create();
STTRMTemplateCopySNC.prototype = {
    initialize: function(originalTemplateGr) {
        this._originalTemplateGr = originalTemplateGr;
        
    },

    /**
     * @param {Object} options
     * @param {boolean} options.retirePreviousTemplateOnPublish
     * @returns {string} sysId of new template
     */
    createCopy: function(options) {
        var newTemplateSysId = this._copyTemplate(options);
        this._copyTemplateFieldPolicies({
            fromParentSysId: this._originalTemplateGr.getUniqueValue(),
            toParentSysId: newTemplateSysId
        });
        this._copyChildRecordTemplates(newTemplateSysId);
        return newTemplateSysId;
    },

    /**
     * @param {Object} options
     * @param {boolean} options.retirePreviousTemplateOnPublish
     * @returns {string} sysId of new template
     */
    _copyTemplate: function(options) {
        var templateGr = new GlideRecord(this._originalTemplateGr.getRecordClassName());
        templateGr.initialize();

        var fields = ChangeCommon.toJS(this._originalTemplateGr);
        for (var i = 0; i < Object.keys(fields).length; i++) {
            var fieldName = Object.keys(fields)[i];
            if (['state', 'previous_sttrm_template', 'awaiting_retirement_approval'].includes(fieldName))
                continue;
            var value = fields[fieldName].value;
            templateGr.setValue(fieldName, value);
        }

        templateGr.setValue('state', 'draft');
        templateGr.setValue('previous_sttrm_template', this._originalTemplateGr.getUniqueValue());
        if (options && options.retirePreviousTemplateOnPublish)
            templateGr.setValue('previous_sttrm_template_retire_on_publish', true);

        var copiedTemplateSysId = templateGr.insert();

        if (options && options.retirePreviousTemplateOnPublish) {
            // update original after creating the copy template to avoid race condition with the Retire Template flow start constraints
            var originalTemplateGr = new GlideRecord(this._originalTemplateGr.getRecordClassName());
            originalTemplateGr.get(this._originalTemplateGr.getUniqueValue());
            originalTemplateGr.setValue('state', 'pending_retirement');
            originalTemplateGr.update();
        }
        
        return copiedTemplateSysId;
    },

    /**
     * @param {Object} options
     * @param {string} options.fromParentSysId
     * @param {string} options.toParentSysId
     */
    _copyTemplateFieldPolicies: function(options) {
        var templateFieldPolicyGr = new GlideRecord('sttrm_template_field_policy');
        templateFieldPolicyGr.addQuery('sttrm_base_template', options.fromParentSysId);
        templateFieldPolicyGr.query();
        while (templateFieldPolicyGr.next()) {
            var templateFieldPolicyGrCopy = new GlideRecord('sttrm_template_field_policy');
            templateFieldPolicyGrCopy.initialize();
            templateFieldPolicyGrCopy.setValue('name', templateFieldPolicyGr.getValue('name'));
            templateFieldPolicyGrCopy.setValue('sttrm_base_template', options.toParentSysId);
            templateFieldPolicyGrCopy.setValue('active', templateFieldPolicyGr.getValue('active'));
            templateFieldPolicyGrCopy.setValue('mandatory', templateFieldPolicyGr.getValue('mandatory'));
            templateFieldPolicyGrCopy.setValue('read_only', templateFieldPolicyGr.getValue('read_only'));
            templateFieldPolicyGrCopy.insert();
        }
    },

    _copyChildRecordTemplates: function(newTemplateSysId) {
        var childTemplateGr = new GlideRecord('sttrm_child_record_template');
        childTemplateGr.addQuery('parent_template', this._originalTemplateGr.getUniqueValue());
        childTemplateGr.query();
        while (childTemplateGr._next()) {
            var newChildTemplateSysId = this._copyChildRecordTemplateGr(childTemplateGr, newTemplateSysId);
            this._copyTemplateFieldPolicies({
                fromParentSysId: childTemplateGr.getUniqueValue(),
                toParentSysId: newChildTemplateSysId
            });
        }
    },

    _copyChildRecordTemplateGr: function(childTemplateGr, newTemplateSysId) {
        var childTemplateGrCopy = new GlideRecord(childTemplateGr.getRecordClassName());
        childTemplateGrCopy.initialize();
        var fields = ChangeCommon.toJS(childTemplateGr);
        for (var i = 0; i < Object.keys(fields).length; i++) {
            var fieldName = Object.keys(fields)[i];
            var value = fields[fieldName].value;
            if (fieldName === 'parent_template')
                continue;
            childTemplateGrCopy.setValue(fieldName, value);
        }
        childTemplateGrCopy.setValue('parent_template', newTemplateSysId);
        return childTemplateGrCopy.insert();
    },

    type: 'STTRMTemplateCopySNC'
};
