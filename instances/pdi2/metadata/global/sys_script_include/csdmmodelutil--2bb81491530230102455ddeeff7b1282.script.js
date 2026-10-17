var CSDMModelUtil = Class.create();
CSDMModelUtil.prototype = {
    initialize: function() {
    },
	
	populateEmptyProductModels: function() {
		//business service
		this._populateModelsForClass('cmdb_ci_service_business', 'name', 'cmdb_service_product_model');
		//technical service
		this._populateModelsForClass('cmdb_ci_service_technical', 'name', 'cmdb_service_product_model');
		//service offering
		this._populateModelsForClass('service_offering', 'name', 'cmdb_service_product_model');
		//application service - only if SAMS plugin isn't enabled,
		//SAMS requires different fields for software_product_model
		if(!GlidePluginManager.isActive('com.snc.sams'))
		    this._populateModelsForClass('cmdb_ci_service_auto', 'name', 'cmdb_software_product_model', 'version');
		//hardware - TBD
		//business application
		this._populateModelsForClass('cmdb_ci_business_app', 'name', 'cmdb_application_product_model');
	},
	
	_populateModelsForClass: function(className, identityField, modelClass, versionField) {
		//Default model is the same for an entire class, fetch it once at the beginning
		var defaultModel = '';
		var classGr = new GlideRecordSecure('cmdb_class_info');
		classGr.addQuery('class', className);
		classGr.query();
		if(classGr.next())
			defaultModel = classGr.getValue('default_model');
		
		var emptyModelGr = new GlideRecordSecure(className);
		emptyModelGr.addNullQuery('model_id');
		emptyModelGr.query();
		while(emptyModelGr.next()){
			var identifier = emptyModelGr.getValue(identityField);
			//If an identifier value is lacking, fall back to the default model class
			if(!identifier){
				emptyModelGr.setValue('model_id', defaultModel);
			} else {
				if(versionField && emptyModelGr.getValue(versionField))
					identifier = gs.getMessage('{0} - version: {1}', [identifier, emptyModelGr.getValue(versionField)]);
				var model = this._createNewProductModel(identifier, modelClass);
				emptyModelGr.setValue('model_id', model);
			}
			emptyModelGr.update();
		}
	},
	
	_createNewProductModel: function(identifier, modelClass) {
		//if a model already exists with this identifier, return that record
		//else return a new record
		var queryRecord = new GlideRecordSecure(modelClass);
		queryRecord.addQuery('name', identifier);
		queryRecord.query();
		if(queryRecord.next()){
			return queryRecord.getUniqueValue();
		} else {
			var modelRecord = new GlideRecordSecure(modelClass);
			modelRecord.initialize();
			modelRecord.setValue('name', identifier);
			return modelRecord.insert();
		}
	},

    type: 'CSDMModelUtil'
};
