var VAGeniusCardCreator = Class.create();
VAGeniusCardCreator.prototype = {
	
	GENIUS_RESULTS: {},
	VA_SYSTEM: {},
	VA_INPUTS: {},
	VA_VARS: {},
	TYPE: null,
	CARD_DATA: {},
	MODEL_GR: null,
	SEARCH_META_DATA:null,
	index:0,
    
	initialize: function(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, type, index) {
		this.SEARCH_META_DATA = searchMetadata;
		this.GENIUS_RESULTS = geniusResults;
		this.VA_SYSTEM = vaSystem;
		this.VA_INPUTS = vaInputs;
		this.VA_VARS = vaVars;
		this.TYPE = type;
		this.CARD_DATA = this._initializeCardData(geniusResults);
		this.index = index;
		this.MODEL_GR = new GlideRecord(this.getTableName());
		this.MODEL_GR.initialize();
		this.LOGGER = VAAISearchHelper.getLogger(this.VA_VARS.loggingContext);
	},
	
	createCard: function() {
		this.preProcess();
		this.createEVAMFields();
		this.LOGGER.debug('{0}: Generating card: type={1}, data={2}',
			this.type, this.TYPE, JSON.stringify(this.CARD_DATA))
		return this.VA_SYSTEM.renderCard(this.TYPE, JSON.stringify(this.CARD_DATA));
	},
	
	setData: function(key, value, alternateKey, alternateValue){
		if (!gs.nil(value)){
			this.CARD_DATA[key] = value;
		} else if (!gs.nil(alternateValue)){
			if (gs.nil(alternateKey))
				this.CARD_DATA[key] = alternateValue;
			else
				this.CARD_DATA[alternateKey] = alternateValue;
		}
	},

	createEVAMFields: function() {
		var evamFieldExists = true;
		var fieldIdx = 0;
		while (evamFieldExists) {
			fieldIdx++;
			if (this._propsContainKey('fieldLabel' + fieldIdx)) {
				// Add the field and if both label and value are present
				if (this._propsContainKey('fieldValue' + fieldIdx))
					this._addEVAMField(fieldIdx);
			} else {
				evamFieldExists = false;
			}
		}
	},

	_propsContainKey: function(key) {
		return !gs.nil(this.CARD_DATA[key]);
	},

	_addEVAMField: function(idx) {
		var fieldLabel = 'fieldLabel' + idx;
		var fieldValue = 'fieldValue' + idx;
		this._addField(this.CARD_DATA[fieldLabel], this.CARD_DATA[fieldValue]);
		delete this.CARD_DATA[fieldLabel];
		delete this.CARD_DATA[fieldValue];
	},

	_addField: function(label, value) {
		this.CARD_DATA.fields.push({
			'fieldLabel': label,
			'fieldValue': value,
			'showSeparator': 'show'
		});
	},

	getSysId: function() {
		var sysId;
		try {
			sysId = this.GENIUS_RESULTS.propValues.actions[0].actionPayload.sysId;
		} catch(ex) {
			sysId = this.getModel()["columns.sys_id"];
		}

		return sysId;
	},

	getTableName: function() {
		var table;
		try {
			table = this.GENIUS_RESULTS.propValues.actions[0].actionPayload.table;
		} catch(ex) {
			table = this.model()["columns.table"];
		}

		return table;
	},

	getActionName: function() {
		var actionName;
		try {
			actionName = this.GENIUS_RESULTS.propValues.actions[0].name;
		} catch(ex) {
			actionName = "";
		}

		return actionName;
	},

	getActionUrl: function() {
		var externalUrl;
		try {
			externalUrl = this.GENIUS_RESULTS.propValues.actions[0].actionPayload.url;
			externalUrl = VAAISearchHelper.correctURLIfRequired(externalUrl);
		} catch(ex) {
			externalUrl = "";
		}
		return externalUrl;
	},
	
	getFieldLabel: function(name) {
		var fieldName = name.replace('columns.', '');
		return this.MODEL_GR[fieldName].getLabel();
	},
	
	preProcess: function() {
		// Optional override
	},
	
	getModel: function() {
		return this.GENIUS_RESULTS.propValues.model;
	},
	
	getMetricsURL: function(url) {
		return url;
	},

	// Create deep copy of results and remove unwanted properties
	_initializeCardData: function(results) {
		var data = JSON.parse(JSON.stringify(results.propValues));
		delete data.model;
		delete data.actions;
		data.fields = [];
		return data;
	},

	type: 'VAGeniusCardCreator'
};
