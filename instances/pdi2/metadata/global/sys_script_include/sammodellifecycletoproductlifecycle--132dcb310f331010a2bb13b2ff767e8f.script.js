var SamModelLifecycleToProductLifecycle = Class.create();
SamModelLifecycleToProductLifecycle.prototype = {
	SAMS_ENABLED: GlidePluginManager.isActive('com.snc.sams'),

	initialize: function() {},

	process: function() {
		this._copyCustomSources();
		this._copyInternalRecords();
		this._copyServiceNowRecords();
	},

	_copyValues: function(oldGR, source) {
		var newGR = new GlideRecord('sam_custom_sw_product_lifecycle');
		newGR.initialize();

		if (this.SAMS_ENABLED) {
			newGR.setValue('norm_product', oldGR.model.product);
		} else {
			newGR.setValue('product_name', oldGR.model.name);
		}

		newGR.setValue('publisher', oldGR.model.manufacturer);
		newGR.setValue('norm_version', oldGR.model.version);
		newGR.setValue('norm_edition', oldGR.model.edition);
		newGR.setValue('lifecycle_phase', oldGR.getValue('lifecycle_phase'));
		newGR.setValue('lifecycle_type', oldGR.getValue('lifecycle_type'));
		newGR.setValue('source', source);
		newGR.setValue('start_date', oldGR.getValue('start_date'));
		newGR.setValue('active', oldGR.getValue('active'));
		newGR.setValue('content_active', oldGR.getValue('content_active'));
		newGR.setValue('risk', oldGR.getValue('risk'));
		newGR.setValue('description', oldGR.getValue('description'));
		newGR.setValue('reported', oldGR.getValue('reported'));
		newGR.setValue('sys_domain', oldGR.getValue('sys_domain'));
		newGR.setValue('sys_created_by', oldGR.getValue('sys_created_by'));
		newGR.setValue('sys_updated_by', oldGR.getValue('sys_updated_by'));
		return newGR.insert();
	},

	// Determine if risk, description, or active fields have been modified
	_isModified: function(lifecycleGR) {
		if (!gs.nil(lifecycleGR.getValue('description'))) {
			return true;
		} // if desc changed
		if (!lifecycleGR.getDisplayValue('active')) {
			return true;
		} // if inactive

		var risk = lifecycleGR.getValue('risk');
		// We used to default risk by phase in script include: SampSWModelLifecycleAPI
		switch (lifecycleGR.getValue('lifecycle_phase')) {
		case 'pre_release':
			return risk !== 'low';
		case 'availability':
			return risk !== 'moderate';
		case 'end_of_life':
			return risk !== 'very_high';
		case 'end_of_support':
			return risk !== 'high';
		case 'end_of_extended_support':
			return risk !== 'very_high';
		default:
			return risk !== 'moderate';
		}
	},

	_copyCustomSources: function() {
		var choiceGR = new GlideRecord('sys_choice');
		choiceGR.addQuery('name', 'sam_sw_model_lifecycle');
		choiceGR.addQuery('element', 'source');
		choiceGR.addQuery('value', '!=', 'internal');
		choiceGR.addQuery('value', '!=', 'service_now');
		choiceGR.query();

		while (choiceGR.next()) {
			var dupGR = new GlideRecord('sys_choice'); // Used to check for duplicate sources
			var newGR = new GlideRecord('sys_choice'); // Used to insert a new source
			newGR.initialize();

			// So that the list of fields will contain the new table name
			choiceGR.setValue('name', 'sam_sw_product_lifecycle');
			var fields = choiceGR.getFields();
			for (var i = 0; i < fields.size(); i++) {
				var currField = fields.get(i);

				if (currField.hasValue()) {
					var field = currField.getName();
					var value = currField.getValue();
					dupGR.addQuery(field, value);
					newGR.setValue(field, value);
				}
			}

			dupGR.query();
			if (!dupGR.hasNext()) {
				newGR.autoSysFields(false);
				newGR.insert();
			}
		}
	},

	_copyInternalRecords: function() {
		var oldGR = new GlideRecord('sam_sw_model_lifecycle');
		oldGR.addQuery('source', '!=', 'service_now');

		if (this.SAMS_ENABLED) {
			oldGR.orderBy('model.product');
		} else {
			oldGR.orderBy('model.name');
		}
		oldGR.orderBy('model.manufacturer');
		oldGR.orderBy('model.version');
		oldGR.orderBy('model.edition');
		oldGR.orderBy('lifecycle_phase');
		oldGR.orderBy('lifecycle_type');
		oldGR.orderBy('source');
		oldGR.orderBy('sys_domain');
		oldGR.orderBy('start_date');
		oldGR.query();

		var prevLifecycleKey;
		while (oldGR.next()) {
			var source = oldGR.getValue('source');
			var product;
			if (this.SAMS_ENABLED) {
				product = oldGR.model.product;
			} else {
				product = oldGR.model.name;
			}

			// If a LC is duplicate of the previous one, keep the one with more conservative date
			// Since its ordered by start_date, it will always insert the earliest LC
			var currLifecycleKey = product + oldGR.model.manufacturer + oldGR.model.version + oldGR.model.edition
			+ oldGR.getValue('lifecycle_phase') + oldGR.getValue('lifecycle_type')
			+ source + oldGR.getValue('sys_domain');
			if (currLifecycleKey === prevLifecycleKey) {
				continue;
			} else {
				prevLifecycleKey = currLifecycleKey;
				this._copyValues(oldGR, source); // insert and return the sysID
			}
		}
	},

	_copyServiceNowRecords: function() {
		var oldGR = new GlideRecord('sam_sw_model_lifecycle');
		oldGR.addQuery('source', 'service_now');
		oldGR.query();

		while (oldGR.next()) {
			// Convert the servicenow record to internal record if modified
			if (this._isModified(oldGR)) {
				this._copyValues(oldGR, 'internal');
			}
		}
	},

	type: 'SamModelLifecycleToProductLifecycle',
};
