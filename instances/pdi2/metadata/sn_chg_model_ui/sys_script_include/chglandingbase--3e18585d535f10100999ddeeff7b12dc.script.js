var ChgLandingBase = Class.create();

ChgLandingBase.CHANGE_REQUEST = "change_request";
ChgLandingBase.CHG_MODEL = "chg_model";
ChgLandingBase.CHG_TEMPLATE = "chg_template";
ChgLandingBase.ALL = "all";
ChgLandingBase.PINNED = "pinned";
ChgLandingBase.MODELS = "change_models";
ChgLandingBase.PREAPPROVED = "preapproved";
ChgLandingBase.NAME = "name";
ChgLandingBase.DESCRIPTION = "name";
ChgLandingBase.TABLE_NAME = "table_name";
ChgLandingBase.CONDITION = "condition";
ChgLandingBase.ORDER = "order";
ChgLandingBase.ORDERBY = "ORDERBY";
ChgLandingBase.STATE = "state";
ChgLandingBase.SHORT_DESCRIPTION = "short_description";
ChgLandingBase.LANDING_MIN_LIMIT = 40;
ChgLandingBase.LIMIT = parseInt(gs.getProperty("sn_chg_model_ui.landing_page.chg_model_scroll_load_limit", "20"), 10);
ChgLandingBase.LANDING_LIMIT = parseInt(gs.getProperty("sn_chg_model_ui.landing_page.chg_model_limit", "40"), 10);
ChgLandingBase.MAX_CHG_MODELS = parseInt(gs.getProperty("sn_chg_model_ui.landing_page.max_chg_models", "300"));
ChgLandingBase.PROP_SUGGESTION_LIMIT  = "sn_chg_model_ui.landing_page.max_suggestions.type.limit";
ChgLandingBase.SUGGESTION_LIMIT = 10;
ChgLandingBase.SYS_USER = "sys_user";
ChgLandingBase.GROUP = "sys_user_group";
ChgLandingBase.ROLE = "sys_user_role";

ChgLandingBase.DEFAULT_ORDER = 1000000;

ChgLandingBase.LOG_PROP = "sn_chg_model_ui.landing_page.log";

ChgLandingBase.DATE_ELEMENT_TYPE = {
	"glide_date_time": true,
	"glide_date": true,
	"due_date": true,
	"date": true,
	"datetime": true
};

ChgLandingBase.JS_EXCLUDE = {
	"sys_scope" : true,
	"sys_replace_on_upgrade" : true,
	"sys_policy" : true,
	"sys_package" : true,
	"sys_customer_update" : true,
	"sys_update_name" : true,
	"sys_mod_count" : true
};

ChgLandingBase.JS_INCLUDE = {
	"cmdb_ci": true,
	"number": true,
	"short_description": true,
	"sys_class_name": true,
	"sys_id": true
};

ChgLandingBase.prototype = {
    initialize: function(_gr, _gs) {
		this._gr = _gr || current;
		this._gs = _gs || gs;
		this._log = new global.GSLog(ChgLandingBase.LOG_PROP, this.type).setLog4J();
    },

	/**
	 * Converts a i18n'd GlideRecord to a JS object taking into account credentials
	 */
	toJS: function() {
		return this._toJS(this._gr);
	},

	_toJS: function(_gr, requiredFields) {
		if (typeof _gr === "undefined" || !_gr.canRead())
			return null;

		var obj = {};
		var el = _gr.getElements();
		for (var i = 0; i < el.length; i++) {
			var elName = el[i].getName() + "";

			if (this._ignoreElement(el[i], elName, requiredFields))
				continue;

			this._toJSAddToObject(_gr, el[i], elName, obj);
		}

		return obj;
	},

	_toJSFields: function(_gr, requiredFields) {
		if (typeof _gr === "undefined" || !_gr.canRead())
			return null;

		var obj = {};

		for (var elName in requiredFields) {
			var el = _gr.getElement(elName);

			if (null === el || null === el.toString() || this._ignoreElement(el, elName, requiredFields))
				continue;

			this._toJSAddToObject(_gr, el, elName, obj);
		}

		return obj;
	},

	_toJSAddToObject: function(_gr, el, elName, obj) {
		var fieldType = el.getED().getInternalType() + "";
		var fieldValue = el.toString();

		fieldValue = this._correctFieldValue(fieldType, fieldValue);

		obj[elName] = {
			'display_value' : el.getDisplayValue(),
			'value' : fieldValue
		};

		//Augment object for date types
		if (ChgLandingBase.DATE_ELEMENT_TYPE[fieldType]) {
			gdt = new GlideDateTime();
			gdt.setValue(el.toString());
			obj[elName].display_value_internal = gdt.getDisplayValueInternal();
		}

		// Security
		obj.__security = {
			canCreate: _gr.canCreate(),
			canRead: _gr.canRead(),
			canWrite: _gr.canWrite(),
			canDelete: _gr.canDelete()
		};

		return obj;
	},

	metadataJS: function() {
		return this._metadataJS(this._gr);
	},

	_metadataJS: function(_gr) {
		if (typeof _gr === "undefined" || !_gr.canRead())
			return null;

		var obj = {};
		obj.__label = _gr.getLabel();
		var tableName = _gr.getTableName();
		var el = _gr.getElements();
		for (var i = 0; i < el.length; i++) {
			var elem = el[i];
			var elName = elem.getName() + "";

			if (!el[i].canRead() || ChgLandingBase.JS_EXCLUDE[elName])
				continue;

			this._metadataJSAddToObject(elem, elName, obj, tableName);
		}

		return obj;
	},

	_metadataJSFields: function(_gr, requiredFields) {
		if (typeof _gr === "undefined" || !_gr.canRead())
			return null;

		var obj = {};
		obj.__label = _gr.getLabel();
		var tableName = _gr.getTableName();

		for (var elName in requiredFields) {
			var elem = _gr.getElement(elName);

			if (null === elem || null === elem.toString() || !elem.canRead() || ChgLandingBase.JS_EXCLUDE[elName])
				continue;

			this._metadataJSAddToObject(elem, elName, obj, tableName);
		}

		return obj;
	},

	_metadataJSAddToObject: function(elem, elName, obj, tableName) {
		obj[elName] = {
			"column_name" : elName,
			"label" : elem.getLabel(),
			"field_type" : elem.getED().getInternalType()
		};

		return obj;
	},

	_ignoreElement: function(el, elName, requiredFields) {
		return (requiredFields && !requiredFields[elName]) || ChgLandingBase.JS_EXCLUDE[elName] || !el.canRead();
	},

	_correctFieldValue: function(fieldType, fieldValue) {
		if (fieldType === "boolean")
			fieldValue = fieldValue === "true" ? true : false;
		else if (fieldType === "integer" || fieldType === "decimal")
			fieldValue = !fieldValue ? fieldValue : fieldValue - 0;

		return fieldValue;
	},

    type: 'ChgLandingBase'
};
