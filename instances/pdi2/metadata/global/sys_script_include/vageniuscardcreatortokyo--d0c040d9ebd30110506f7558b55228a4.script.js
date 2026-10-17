var VAGeniusCardCreatorTokyo = Class.create();
VAGeniusCardCreatorTokyo.prototype = {

	GENIUS_RESULTS: {},
	VA_SYSTEM: {},
	VA_INPUTS: {},
	VA_VARS: {},
	TYPE: null,
	CARD_DATA: {},
	MODEL_GR: null,
	SEARCH_META_DATA:null,
	DYNAMIC_CHOICE_NODE_NAME: null,
	index:0,
	originalURL: null,

	initialize: function(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, type, index, dynamicChoiceNodeName) {
		this.SEARCH_META_DATA = searchMetadata;
		this.GENIUS_RESULTS = geniusResults;
		this.VA_SYSTEM = vaSystem;
		this.VA_INPUTS = vaInputs;
		this.VA_VARS = vaVars;
		this.TYPE = type;
		this.DYNAMIC_CHOICE_NODE_NAME = dynamicChoiceNodeName;
		this.CARD_DATA = this._initializeCardData(geniusResults);
		this.index = index;
		this.MODEL_GR = new GlideRecord(this.getTableName());
		this.MODEL_GR.initialize();
		this.LOGGER = global.VAAISearchHelperTokyo.getLogger(this.VA_VARS.loggingContext);
	},
	
	createCard: function() {
		this.preProcess();
		this.getTranslations();
		this.createEVAMFields();
		this.LOGGER.debug('{0}: Generating card: type={1}, data={2}',
			this.type, this.TYPE, JSON.stringify(this.CARD_DATA));
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
			this.LOGGER.info("Could not read sysId from action payload");
		}

		if (gs.nil(sysId))
			sysId = this.getModel()["columns.sys_id"] || this.getModel().sys_id; // Handle GR and regular result

		return sysId;
	},

	getTableName: function() {
		var table;
		try {
			table = this.GENIUS_RESULTS.propValues.actions[0].actionPayload.table;
		} catch(ex) {
			this.LOGGER.info("Could not read table name from action payload");
		}

		if (gs.nil(table))
			table = this.getModel()["columns.table"] || this.getModel().table; // Handle GR and regular result

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
			externalUrl = global.VAAISearchHelper.correctURLIfRequired(externalUrl);
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

	getTranslations: function() {
		// Optional override
	},

	getModel: function() {
		return this.GENIUS_RESULTS.propValues.model;
	},

	setURL: function(url) {
		this.originalURL = url;
	},
	
	getMetricsURL: function() {

		// if we didn't set url previously, generate it here
		if (gs.nil(this.originalURL))
			this.originalURL = global.VAAISearchHelperTokyo.createURLByActionPayload(this.getTableName(), this.getSysId(), this.getActionName(), this.VA_SYSTEM, false, this.DYNAMIC_CHOICE_NODE_NAME);

		return global.VAAISearchClickMetricsURLHelper.createGeniusSearchEventMetricsURL(
			this.SEARCH_META_DATA, this.GENIUS_RESULTS, this.VA_SYSTEM, this.VA_INPUTS, this.VA_VARS, this.originalURL, this.index);
	},

	// Create deep copy of results and remove unwanted properties
	_initializeCardData: function(results) {
		var data = JSON.parse(JSON.stringify(results.propValues));
		delete data.model;
		delete data.actions;
		data.fields = [];
		return data;
	},

	type: 'VAGeniusCardCreatorTokyo'
};
