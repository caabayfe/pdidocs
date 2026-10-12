// PlaybookUtils class holds convenience routines used by the Playbook - shared plugin
var PlaybookUtils = Class.create();
PlaybookUtils.prototype = {

	/** 
	 * String that will prepend the copied record name field
	 */
	COPY_OF: gs.getMessage('Copy of '),
	UI: gs.getMessage('UI'),
	BLANK_ACTIVITY_UI_SYS_ID: 'ecf7ce28ff313010667053ea793bf126',
	DEFAULT_ACTIVITY_UI_SYS_ID: '0f3d316cff313010667053ea793bf150',


	/**
	 * Creates a copy record from a src GlideRecord, setting and copying the requested fields
	 *
	 * @param src GlideRecord of the source of the copy, like current in a UI Action
	 * @param setFields Array of objects with key/value pairs where key is field name, and value if its value
	 * @return GlideRecord of copied record
	 */
	copyRecord: function(src, setFields) {
		if(setFields)
			this._setFields(src, setFields);
		
		src.insert();
		return src;
	},
	
	/**
	 * Creates a copy of related records that reference a src reference field, setting and copying the requested fields
	 *
	 * @param refTable table of reference records
	 * @param refField field of the above table that holds the reference record
	 * @param srcSysId field value of the holding the reference record
	 * @param dstSysId field value of the reference field to be copied
	 * @param setFields Array of objects with key/value pairs where key is field name, and value if its value 
	 */
	copyRelatedRecords: function(refTable, refField, srcSysId, dstSysId, setFields) {  
		// create new refTable entries
		var grSourceTable = new GlideRecord(refTable);
		grSourceTable.query(refField, srcSysId);

		while(grSourceTable.next()) {
			grSourceTable.setValue(refField, dstSysId);
			
			if(setFields)
				this._setFields(grSourceTable, setFields);
			
			grSourceTable.insert();
		}
	},
	
	// Sets fields on a destination record during a copy
	_setFields: function(dst, setFields) {
		setFields.forEach(function(field) {
			for (var name in field) 
				dst.setValue(name, field[name]);
		});
	},
	
	/**
	* Creates a copy of the default activity UI when provided an activity type 
	 *
	 * @param activity_type gliderecord of the activity type to clone the default activity UI from
	*/
	copyDefaultActivityUIOfActivityType: function(activity_ui_id, activity_type_id) {
		var updateManager = new GlideUpdateManager2();
		var oldActivityUI = new GlideRecord('sys_playbook_experience_activity_ui');
		oldActivityUI.get(activity_ui_id);
		
		var copiedActivityUI = new GlideRecord('sys_playbook_experience_activity_ui');
		var newCopyName = this.getCopyName(copiedActivityUI.getTableName(), 'name', oldActivityUI.name);
		copiedActivityUI.setValue('name', newCopyName);
		copiedActivityUI.setValue('playbook_experience', oldActivityUI.playbook_experience);
		// We set the experience_type to be from oldActivityUI to workaround the clone defect where sample data are not copied
		copiedActivityUI.setValue('experience_type', oldActivityUI.getValue('experience_type'));
		// set the ui template to the previous default activity UI, which should force the BR to run on insert and clone everything needed
		copiedActivityUI.setValue('ui_template', oldActivityUI.getUniqueValue());
		var newSysId = copiedActivityUI.insert();
		// Update the activity UI with the new experience_type
		copiedActivityUI.get(newSysId);
		copiedActivityUI.setWorkflow(false);
		copiedActivityUI.setValue('experience_type', activity_type_id);
		copiedActivityUI.update();
		copiedActivityUI.setWorkflow(true);

		updateManager.saveRecord(copiedActivityUI); // capture the experience_type (layout) change in update set
		return copiedActivityUI;
	},
	
	/**
	 * Creates a new activity UI based on the blank template
	 *
	 * @param activity_type gliderecord of the activity type to set the new experience type to
	*/
	createNewBlankActivityUI: function(activity_type) {
		var DEFAULT_EXPERIENCE_SYS_ID = '98e09a560f2200102920c912d4767e1a';
			
		var newActivityUI = new GlideRecord('sys_playbook_experience_activity_ui');
		var newName = this.getCopyName(newActivityUI.getTableName(), 'name', activity_type.getValue('name') + ' ' + this.UI);
		newActivityUI.setValue('name', newName);
		newActivityUI.setValue('playbook_experience', DEFAULT_EXPERIENCE_SYS_ID);
		newActivityUI.setValue('experience_type', activity_type.getUniqueValue());
		
		// set the ui template to blank, which should force the BR to run on insert and clone everything needed
		newActivityUI.setValue('ui_template', this.BLANK_ACTIVITY_UI_SYS_ID);
		newActivityUI.insert();
		
		return newActivityUI;
	},
	
	/**
	* Creates a copy of Activity Type form view related variable records in sys_ui_form, 
	* sys_ui_form_section, sys_choice, sys_ui_section and sys_ui_element tables
	*
	* @param tableSysId the sys_id of form property fileds table to clone
	* @param cloneSysId cloned form property fileds table sys_id
	*/
	copyVariableRecords: function(tableSysId, cloneSysId) {
		var formSections = { }; // sys_ui_form_section records data
		var grFormSection;      // sys_ui_form_section record
		
		var tableName = 'var__m_sys_pd_activity_type_prop_' + tableSysId;  // source table
		var clonedTable = 'var__m_sys_pd_activity_type_prop_' + cloneSysId;  // table clone
		
		// clone sys_ui_form entries with new .name
		var updateManager = new GlideUpdateManager2();
		var grUIForm = new GlideRecord('sys_ui_form');
		grUIForm.query('name', tableName); 

		while (grUIForm.next()) {
			var uiFormSysId = grUIForm.getUniqueValue();   
			
			grUIForm.setValue('name', clonedTable);
			grUIForm.insert();
			
			var cloneUIFormSysId = grUIForm.getUniqueValue();

			// gather sys_ui_form_section entries, which define section view layout positions
			grFormSection = new GlideRecord('sys_ui_form_section');   
			grFormSection.query('sys_ui_form', uiFormSysId); 

			while (grFormSection.next()) {
				formSections[grFormSection.sys_ui_section] = {
					form_sys_id: uiFormSysId,
					cloned_form_sys_id: cloneUIFormSysId,
					position: grFormSection.getValue('position')
				};
			}    
		}
		
		// clone sys_choice entries with new .name
		var grChoice = new GlideRecord('sys_choice');
		grChoice.query('name', tableName); 
		
		while (grChoice.next()) {
			grChoice.setValue('name', clonedTable);
			grChoice.insert();
		}
		
		// clone sys_ui_section records with new .name
		var grUISection = new GlideRecord('sys_ui_section');
		grUISection.query('name', tableName); 
		
		while (grUISection.next()) {
			var uiSectionSysId = grUISection.getUniqueValue();
			
			grUISection.setValue('name', clonedTable);
			grUISection.insert();

			updateManager.saveRecord(grUISection); // capture the sys_ui_section records in update set

			var clonedUISectionSysId = grUISection.getUniqueValue();
			
			// clone sys_ui_element records with new sys_ui_element.sys_ui_section <- sys_ui_section.sys_id
			var grUIElement = new GlideRecord('sys_ui_element');
			grUIElement.query('sys_ui_section', uiSectionSysId);

			while (grUIElement.next()) {
				grUIElement.setValue('sys_ui_section', clonedUISectionSysId);
				grUIElement.insert();
			}

			updateManager.saveRecord(grUIElement); // capture the sys_ui_element records in update set

			// if there is sys_ui_form_section record, create new: 
			// sys_ui_form_section.sys_ui_form <- sys_ui_form.sys_id and 
			// sys_ui_form_section.sys_ui_section <- sys_ui_section.sys_id
			if (grFormSection && uiSectionSysId in formSections) {
				var formSection = formSections[uiSectionSysId];
				
				grFormSection.setValue('sys_ui_form', formSection.cloned_form_sys_id);
				grFormSection.setValue('sys_ui_section', clonedUISectionSysId);
				grFormSection.setValue('position', formSection.position);
				grFormSection.insert();
			}
		}

		updateManager.saveRecord(grUIForm); // capture all the sys_ui_form_section in update set
	},

	/**
	 * Creates a unique name for a copied records based on editing the name to prepend 'Copy of' and append an 
	 * incrementing number
	 *
	 * @param table for the name calculation
	 * @param field of the above table for the name calculation
	 * @param name value of the source name to derive new name 
	 * @return new name value
	 */
	getCopyName: function(table, field, name) {
		var MAXCopies = 100;
		//Get the next number to use for the title/name
		var gr = new GlideAggregate(table);
		gr.addAggregate('COUNT');
		gr.addQuery(field, 'STARTSWITH', this.COPY_OF + name);
		gr.addQuery(field, '!=', name);
		gr.query();
		gr.next();		
		var num = parseInt(gr.getAggregate('COUNT')) + 1;
		for(var i = num; i < MAXCopies; i++) {
			var newName = this.COPY_OF + name + ' ' + i;
			gr = new GlideRecord(table);
			gr.addQuery(field, newName);
			gr.query();
			if(!gr.hasNext())
				break;
		}
		return newName;
	},
	
	// Handle the field exclusion calculation, true if excluded, false otherwise
	_fieldExcluded: function(field, excludeList) {
		var ret = false;
		excludeList.some(function(exclude) {
			if(field.startsWith(exclude)) {
				ret=true;
				return ret;
			}
		});
		return ret;
	},
	
	type: 'PlaybookUtils'
};
