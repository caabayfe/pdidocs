var SNHelpDomainUtil = Class.create();
SNHelpDomainUtil.prototype = {
    initialize: function() {
		this.constants = new SNHelpConstantProvider();
    },
	// cascade Domain to related records 
	// Currently We are not supporting this as its creating problem with overriden records.
    cascadeCurrentDomain: function(current, table, field) {
        var gr = new GlideRecord(table);
        var hasDomain = gr.isValidField("sys_domain");
        gr.addQuery(field, current.sys_id);
        gr.queryNoDomain(); // Parent domain is changed. Update all child domain irrespective of domain
        while (gr.next()) {
            if (hasDomain) {
                gr.setWorkflow(false);
                gr.setValue("sys_domain", current.sys_domain);
                gr.update();
            }
            // Updating related records domains below as setworkflow is false.
            // if step type is survey or step layout is question/image_question - cascade domain to question and answers. 
            if (table === this.constants.tables.guidance_step && (gr.type === this.constants.survey || this.constants.questionType.indexOf(gr.layout) >= 0))
                this.cascadeCurrentDomain(gr, this.constants.tables.content, this.constants.tableColumns.guidance_step);
            else
                this.cascadeDomain(gr, this.constants.tables.content, this.constants.tableColumns.guidance_step);

            if (table === this.constants.tables.content)
                this.cascadeCurrentDomain(gr, this.constants.tables.question, this.constants.tableColumns.content);
            if (table === this.constants.tables.question)
                this.cascadeDomain(gr, this.constants.tables.answer, this.constants.tableColumns.question);
        }
    },

    //Optimised method for updating multiple records at once.
    cascadeDomain: function(current, table, field) {
        var gr = new GlideMultipleUpdate(table);
        gr.addQuery(field, current.sys_id);
        gr.setValue('sys_domain', current.sys_domain);
        gr.execute();
    },

    copyRelatedRecords: function(table, field, oldValue, newValue) {
        var oldSysId,
            newSysId,
            relatedTable,
            gr;
        gr = new GlideRecord(table);
        gr.addQuery(field, oldValue);
        gr.query();
        while (gr.next()) {
            oldSysId = gr.getValue("sys_id").toString();
            gr.setValue(field, newValue);
			gr.setValue("sys_domain", gs.getUser().getDomainID());
            newSysId = gr.insert();
            relatedTable = this.getRelatedTablewithRefField(gr.getRecordClassName());
			if(Array.isArray(relatedTable)) {
				for(var i = 0; i < relatedTable.length; i++)
					this.copyRelatedRecords(relatedTable[i].tableName, relatedTable[i].refField, oldSysId, newSysId);
			} else if (relatedTable) {
                this.copyRelatedRecords(relatedTable.tableName, relatedTable.refField, oldSysId, newSysId);
            }
        }
    },

    getRelatedTablewithRefField: function(table) {
        switch (table) {
            case this.constants.tables.guidance:
                return {
                    tableName: this.constants.tables.guidance_step,
                    refField: this.constants.tableColumns.guidance
                };
            case this.constants.tables.guidance_step:
                return [
					{
						tableName: this.constants.tables.content,
						refField: this.constants.tableColumns.guidance_step
					},
					{
						tableName: this.constants.tables.m2m_step_dependency,
						refField: this.constants.tableColumns.guidance_step
					}];
            case this.constants.tables.content:
                return {
                    tableName: this.constants.tables.question,
                    refField: this.constants.tableColumns.content
                };
            case this.constants.tables.question:
                return {
                    tableName: this.constants.tables.answer,
                    refField: this.constants.tableColumns.question
                };
            default:
                return null;
        }
    },

    overrideCopy: function(current) {
        var relatedTable = this.getRelatedTablewithRefField(current.getRecordClassName());
		if(Array.isArray(relatedTable))
			for(var i = 0; i < relatedTable.length; i++)
				this.copyRelatedRecords(relatedTable[i].tableName, relatedTable[i].refField, current.sys_overrides, current.getUniqueValue());
		else if (relatedTable)
			this.copyRelatedRecords(relatedTable.tableName, relatedTable.refField, current.sys_overrides, current.getUniqueValue());
    },

	restrictDeleteToSameDomain: function(current) {
		// Allow delete from global domain
		if(gs.getUser().getDomainID() == null || gs.getUser().getDomainID() == "global")
			return;
		if(current.sys_domain != gs.getUser().getDomainID()) {
			gs.addErrorMessage(gs.getMessage("Can't delete - Record domain is different from session domain"));
			current.setAbortAction(true);
		}
	},

    type: 'SNHelpDomainUtil'
};
