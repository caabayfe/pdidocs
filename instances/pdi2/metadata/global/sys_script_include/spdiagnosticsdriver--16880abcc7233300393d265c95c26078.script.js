var SPDiagnosticsDriver = Class.create();
SPDiagnosticsDriver.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	widgetCategorization: new SPWidgetCategorization(),

	// System property – kill switch for strict validation (default: on)
	STRICT: 'glide.service_portal.diagnostics.strict_validation',

	_isStrict: function () {
		return gs.getProperty(this.STRICT, 'true') === 'true';
	},

	/* Constants */
	// Table Names
	TBL: {
		SP_REL_WID_CLONE: 'sp_rel_widget_clone',
		SYS_UPDATE_VERSION: 'sys_update_version',
		SP_WIDGET: 'sp_widget'
	},

	// Column Names
	COL: {
		NAME: 'name',
		SRC_TBL: 'source_table',
		STATE: 'state'
	},

	// Categories
	CATEGORY: {
		UNCATEGORIZED: 0,
		OOTB: 1,
		CLONED: 2,
		BRAND_NEW: 3,
		CUSTOMIZED: 4
	},

	// Column Values
	OOTB_TBLS: ['sys_upgrade_history', 'sys_store_app'],
	CHILD: 'child',
	NAME: 'name',
	DESCRIPTION: 'description',
	SYS_CLASS_NAME: 'sys_class_name',
	SP_INSTANCE: 'sp_instance',
	SP_WIDGET: 'sp_widget',
	CURRENT: 'current',
	PREVIOUS: 'previous',

	// Entry point for the Ajax Call to be made from client side
	categorize: function (arrIDs) {
		var strInstanceIds = this.getParameter('sysparm_instances_array') || arrIDs;
		if (!strInstanceIds)
			return;

		var parsed;
		try {
			parsed = JSON.parse(strInstanceIds);
		} catch (e) {
			gs.warn('SPDiagnosticsDriver: malformed JSON in sysparm_instances_array');
			return JSON.stringify({});
		}

		var instWidgetMap = this.categorizeInstances(parsed) || {} ;
		return JSON.stringify(instWidgetMap);
	},

	categorizeInstances: function (arrInstanceIds) {

		var widgetCustMap = {};
		var processed = {};
		var widgetCustDetailsObj = {};
		var instanceCustDetailsObj = {};
		var shouldItProcess = false;
		var retObj = {};
		var instWidgetMap;

		instWidgetMap = _getInstanceToWidgetsMap.call(this, arrInstanceIds) || {};

		for (var instanceId in instWidgetMap) {

			var widgetId = instWidgetMap[instanceId];

			// Null widgetId means the instanceId was rejected by validation;
			// emit UNCATEGORIZED so every requested key appears in the response.
			if (!widgetId) {
				retObj[instanceId] = { widgetCustDetails: {
					widSysId: instanceId,
					category: this.CATEGORY.UNCATEGORIZED,
					dependencies: [], providers: [], templates: []
				}};
				continue;
			}

			shouldItProcess = !processed[widgetId];

			if (shouldItProcess) {
				widgetCustDetailsObj = _categorizeWidget.call(this, widgetId);
				delete widgetCustDetailsObj.isCategorized;
				widgetCustMap[widgetId] = widgetCustDetailsObj;
				processed[widgetId] = true;
			} else
				widgetCustDetailsObj = widgetCustMap[widgetId];

			instanceCustDetailsObj.widgetCustDetails = widgetCustDetailsObj;
			retObj[instanceId] = JSON.parse(JSON.stringify(instanceCustDetailsObj));
		}
		return retObj;
	},

	type: 'SPDiagnosticsDriver'
});

// Private functions

function _getWidgetDetails (widSysId) {

	var retObj = {
		name: '',
		description: ''
	};
	var grTBL = new GlideRecord(this.SP_WIDGET);
	if (grTBL.get(widSysId)) {
		retObj.name = grTBL.getDisplayValue(this.NAME) || '';
		retObj.description = grTBL.getDisplayValue(this.DESCRIPTION) || '';
		this.TBL.SP_WIDGET = grTBL.getValue(this.SYS_CLASS_NAME) || this.SP_WIDGET;
	}
	return retObj;
}

function _getInstanceToWidgetsMap (instanceIdArr) {

	var instWidgetMap = {};
	var instArrlength =  instanceIdArr.length;
	var	instanceId;
	var	widgetId;
	var	index;

	for (index = 0; index < instArrlength; index++) {
		instanceId = instanceIdArr[index];
		widgetId = _getWidgetForInstance.call(this, instanceId);
		instWidgetMap[instanceId] = widgetId;
	}

	return instWidgetMap;
}

function _getWidgetForInstance (instanceId) {

	var grSPInstance = new GlideRecord(this.SP_INSTANCE);
	if (grSPInstance.get(instanceId))
		return grSPInstance.getValue(this.SP_WIDGET);

	// Embedded widgets: instanceId is the widget's SYS_ID (never sp_widget.id – the
	// categorization queries build 'sp_widget_<sys_id>' keys and require the sys_id form).
	if (this._isStrict()) {
		if (instanceId && GlideStringUtil.isEligibleSysID(instanceId))
			return instanceId;

		gs.warn('SPDiagnosticsDriver: rejected non-sys_id instance id (len=' +
			(instanceId ? String(instanceId).length : 0) + ')');
		return null;
	}

	return instanceId;
}

// Main function called for categorizing each widget
function _categorizeWidget (widgetId) {

	var widgetDetails = _getWidgetDetails.call(this, widgetId);
	var strict = this._isStrict();

	var widgetCustomizationMetaCloned = {
		widSysId: widgetId,
		categoryCheck: this.CATEGORY.CLONED,
		custCheck: false,
		table: this.TBL.SP_REL_WID_CLONE,
		queryField: this.CHILD,
		queryValue: widgetId,
		strict: strict
	};

	var widgetCustomizationMetaNew = {
		widSysId: widgetId,
		categoryCheck: this.CATEGORY.BRAND_NEW,
		custCheck: false,
		table: this.TBL.SYS_UPDATE_VERSION,
		queryField: this.COL.NAME,
		queryValue: this.TBL.SP_WIDGET + '_' + widgetId,
		secondEncodedQuery: this.COL.SRC_TBL + 'IN' + this.OOTB_TBLS.toString(),
		strict: strict
	};

	var widgetCustomizationMetaCustomized = {
		widSysId: widgetId,
		categoryCheck: this.CATEGORY.CUSTOMIZED,
		custCheck: true,
		firstEncodedQuery: this.COL.STATE + '=' + this.PREVIOUS,
		secondEncodedQuery: this.COL.SRC_TBL + 'IN' + this.OOTB_TBLS.toString(),
		thirdEncodedQuery: this.COL.STATE + '=' + this.CURRENT,
		sysClassName: this.TBL.SP_WIDGET,
		strict: strict
	};

	var catObj = this.widgetCategorization.isWidgetCategorized(widgetCustomizationMetaCloned);
	if (!catObj.isCategorized) {
		catObj = this.widgetCategorization.isWidgetCategorized(widgetCustomizationMetaNew);
		if (!catObj.isCategorized) {
			catObj = this.widgetCategorization.isWidgetCategorized(widgetCustomizationMetaCustomized);
			if (!catObj.isCategorized)
				catObj.category = this.CATEGORY.OOTB;
		}
	}
	catObj.name = widgetDetails.name;
	catObj.description = widgetDetails.description;

	return catObj;
}
