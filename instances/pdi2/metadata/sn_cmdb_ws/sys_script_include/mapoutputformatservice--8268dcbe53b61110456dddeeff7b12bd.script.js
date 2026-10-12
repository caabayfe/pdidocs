var MapOutputFormatService = Class.create();
MapOutputFormatService.prototype = {

	PROPERTY_LABEL_MAP: {},

	initialize: function () {
		this.inherit([
			MapBase
		]);
	},

	_newEdge: function (args) {

		var sysId = args.sysId;
		var parent = args.parent;
		var child = args.child;
		var type = args.type;
		var port = args.port;
		var isVirtual = args.isVirtual;
		var endpoints = args.endpoints;
		var createdOn = args.createdOn;
		var isReference = args.isReference;

		var edge = {};
		edge[this.ID] = sysId;
		edge[this.PARENT] = parent;
		edge[this.CHILD] = child;
		edge[this.REL_TYPE] = isReference ? gs.getMessage('Reference') : type;
		edge[this.PORT] = this._getValueOrDefault(port, null);
		edge[this.IS_VIR_CONN] = this._getValueOrDefault(isVirtual, false);
		edge[this.IS_REF] = this._getValueOrDefault(isReference, false);
		edge[this.ENDPOINTS] = this._getValueOrDefault(endpoints, []);
		edge[this.INTERNAL_ID] = isReference ? "reference" : type;
		if (createdOn) {
			edge[this.COL_SYS_CREATED_ON] = createdOn.getNumericValue();
		}
		return edge;
	},

	_newReferenceEdge: function (parent, child, type) {
		//generate a sys_id since Ci ref Ci don't have one
		var sysId = parent + "_" + type + "_" + child;
		var edgeObj = {
			sysId: this._generateMD5Hex(sysId),
			parent: parent,
			child: child,
			type: type,
			port: null,
			isVirtual: false,
			endpoints: [],
			createdOn: null,
			isReference: true
		};
		return this._newEdge(edgeObj);

	},

	_getCINodeInfo: function (sysIds, level, skipLifeCycleCheck) {
		var result = {};
		if (sysIds == null || sysIds.length === 0) {
			return result;
		}
		if (this._isEmptyObj(this.PROPERTY_LABEL_MAP)) {
			this.PROPERTY_LABEL_MAP = this.getCiAttributeMetadata();
		}
		var gr = new GlideRecordSecure(this.NODE_MAP_TABLE.CMDB_CI);
		gr.addQuery(this.COL_SYS_ID, this.IN_OP, sysIds);
		if (!skipLifeCycleCheck) {
			gr.addNullQuery(this.COL_LIFE_CYCLE_STAGE).addOrCondition(this.COL_LIFE_CYCLE_STAGE, this.IN_OP, this.LIFE_CYCLE_STAGE_INCLUSION_LIST);
		}
		gr.query();
		var sysId = null;
		while (gr.next()) {
			sysId = gr.getUniqueValue();
			result[sysId] = {};
			result[sysId][this.NAME] = gr.getValue(this.COL_NAME);
			result[sysId][this.CLASS] = gr.getDisplayValue(this.SYS_CLASS_NAME);
			result[sysId][this.COL_LAYER] = '';
			if (typeof level !== 'undefined' && level !== null)
				result[sysId][this.FIXED_LAYER] = level;
			result[sysId][this.PROPERTIES] = this._formNodeProperties(gr);
			result[sysId][this.IS_ENDPOINT] = this._isEndPoint(result[sysId][this.PROPERTIES][this.SYS_CLASS_NAME][this.VALUE]);
			result[sysId][this.CONNECTIONS] = [];
			var createdOnDateTime = new GlideDateTime(gr.getValue(this.COL_SYS_CREATED_ON));
			result[sysId][this.COL_SYS_CREATED_ON] = createdOnDateTime.getNumericValue();
			result[sysId][this.COL_LIFE_CYCLE_STAGE] = gr.getValue(this.COL_LIFE_CYCLE_STAGE) || '';

		}
		return result;
	},

	_formNodeProperties: function (glideRecord) {
		var props = {};
		var location = glideRecord.getValue(this.COL_LOCATION);
		var ownedBy = glideRecord.getValue(this.COL_OWNED_BY);
		props[this.SYS_CLASS_NAME] = this._getPropWithLabelValue(this.PROPERTY_LABEL_MAP[this.SYS_CLASS_NAME], glideRecord.getValue(this.SYS_CLASS_NAME));
		props[this.COL_LOCATION] = this._getPropWithLabelValue(this.PROPERTY_LABEL_MAP[this.COL_LOCATION], global.JSUtil.nil(location) ? '' : location);
		props[this.COL_OWNED_BY] = this._getPropWithLabelValue(this.PROPERTY_LABEL_MAP[this.COL_OWNED_BY], global.JSUtil.nil(ownedBy) ? '' : ownedBy);
		props[this.COL_SYS_UPDATED_ON] = this._getPropWithLabelValue(this.PROPERTY_LABEL_MAP[this.COL_SYS_UPDATED_ON], glideRecord.getValue(this.COL_SYS_UPDATED_ON));
		props[this.COL_DISCOVERY_SOURCE] = this._getPropWithLabelValue(this.PROPERTY_LABEL_MAP[this.COL_DISCOVERY_SOURCE], glideRecord.getValue(this.COL_DISCOVERY_SOURCE) || '', glideRecord.getValue(this.COL_DISCOVERY_SOURCE));
		props[this.COL_LAST_DISCOVERED] = this._getPropWithLabelValue(this.PROPERTY_LABEL_MAP[this.COL_LAST_DISCOVERED], glideRecord.getValue(this.COL_LAST_DISCOVERED) || '');
		return props;
	},

	getCiAttributeMetadata: function () {
		var cacheKey = 'CI_ATTR_META_DATA';
		var strResult = this._cacheGet(cacheKey);
		var metadata = {};
		if (global.JSUtil.nil(strResult)) {
			var gr = new GlideRecord(this.NODE_MAP_TABLE.CMDB_CI);
			metadata[this.COL_OWNED_BY] = gr.getElement(this.COL_OWNED_BY).getLabel();
			metadata[this.COL_NAME] = gr.getElement(this.COL_NAME).getLabel();
			metadata[this.COL_DISCOVERY_SOURCE] = gr.getElement(this.COL_DISCOVERY_SOURCE).getLabel();
			metadata[this.COL_LAST_DISCOVERED] = gr.getElement(this.COL_LAST_DISCOVERED).getLabel();
			metadata[this.COL_SYS_UPDATED_ON] = gr.getElement(this.COL_SYS_UPDATED_ON).getLabel();
			metadata[this.COL_LOCATION] = gr.getElement(this.COL_LOCATION).getLabel();
			metadata[this.SYS_CLASS_NAME] = gr.getElement(this.SYS_CLASS_NAME).getLabel();
			metadata[this.COL_LAYER] = this.LBL_LAYER;
			this._cachePut(cacheKey, JSON.stringify(metadata));
		} else {
			metadata = JSON.parse(strResult);
		}
		return metadata;
	},

	_getPropLabel: function (propKey) {
		return this.PROPERTY_LABEL_MAP[propKey];
	},

	_getValueOrDefault: function (value, defValue) {
		return global.JSUtil.nil(value) ? defValue : value;
	},

	_mergeCMDBSMMap: function (cmdbResult, smResult, messages) {
		var arrayUtil = this.arrayUtil;
		cmdbResult[this.SERVICE_MAP_INFO] = smResult[this.MAP_INFO];
		for (var ci in smResult[this.CI_NODE_INFO]) {
			if (!this._hasProperty(ci, cmdbResult[this.CI_NODE_INFO])) {
				cmdbResult[this.CI_NODE_INFO][ci] = smResult[this.CI_NODE_INFO][ci];
			} else {
				var fixedLayer = cmdbResult[this.CI_NODE_INFO][ci][this.FIXED_LAYER];
				//for application ci just concat the connections array rest are already sent by SM API
				var tmpConnectionArr = [];
				this.arrayUtil.concat(tmpConnectionArr, smResult[this.CI_NODE_INFO][ci][this.CONNECTIONS]);
				this.arrayUtil.concat(tmpConnectionArr, cmdbResult[this.CI_NODE_INFO][ci][this.CONNECTIONS]);
				cmdbResult[this.CI_NODE_INFO][ci] = smResult[this.CI_NODE_INFO][ci]; //copy the ci details from SM
				cmdbResult[this.CI_NODE_INFO][ci][this.CONNECTIONS] = tmpConnectionArr;
				cmdbResult[this.CI_NODE_INFO][ci][this.FIXED_LAYER] = fixedLayer;
			}
			if (cmdbResult[this.CI_NODE_INFO][ci].properties[this.CREATED]) {
				var sysCreatedOn = cmdbResult[this.CI_NODE_INFO][ci].properties[this.CREATED] + "";
				cmdbResult[this.CI_NODE_INFO][ci][this.COL_SYS_CREATED_ON] = new GlideDateTime(sysCreatedOn).getNumericValue();
				delete cmdbResult[this.CI_NODE_INFO][ci].properties[this.CREATED];
			}
		}

        // Add SM API result message(if exist & if messages array supplied)
        if (smResult.cmdbMessage && Array.isArray(messages)) {
            messages.push(this._generateMessageObj({
                severity: this.MESSAGE_SEVERITY.INFO,
                message: smResult.cmdbMessage.message,
                autoDismiss: smResult.cmdbMessage.autoDismiss
            }));
        }
    },

	_getDefaultLayerJson: function () {
		var cacheKey = 'CMDB_LAYER_CHOICES';
		var strResult = this._cacheGet(cacheKey);
		var cmdbLayers = {};
		if (global.JSUtil.nil(strResult)) {
			var gr = new GlideRecordSecure('sys_choice');
			gr.addQuery('name', 'cmdb_layer');
			gr.addQuery('element', 'layer');
			gr.addQuery('language', 'en');
			gr.query();
			while (gr.next()) {
				cmdbLayers[gr.getValue('value')] = false;
			}
			this._cachePut(cacheKey, JSON.stringify(cmdbLayers));
		} else {
			cmdbLayers = JSON.parse(strResult);
		}
		return cmdbLayers;
	},

	type: 'MapOutputFormatService'
};
