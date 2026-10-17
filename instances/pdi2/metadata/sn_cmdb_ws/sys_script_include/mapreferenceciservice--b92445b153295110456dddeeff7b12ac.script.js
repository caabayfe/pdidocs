var MapReferenceCIService = Class.create();
MapReferenceCIService.prototype = {

	initialize: function() {
		this.configUtil = new CmdbWsConfigUtils();
		this.referenceDefintion = null;
	},

	_getReferences: function(args) {
		var ciSysIds = args.ciSysIds;
		var result = args.result;
		var transientState = args.transientState;
		// Query references table
		var refMetadata = this._getReferenceMetadata(args);
		var arrayUtil = this.arrayUtil;
		var ciNodeInfo = result[this.CI_NODE_INFO];
		
		var refResult = {};
		var fetchedRefcount = 0;
		
		// Keep track of CIs which are "new", meaning not existing nodes on the map
		var newCis = [];
		
		for (var j = 0; j < ciSysIds.length; j++) {
			
			var ciSysId = ciSysIds[j];
			
			if (transientState['refCiVisited'].hasOwnProperty(ciSysId) || !ciNodeInfo.hasOwnProperty(ciSysId))
				continue;
			
			if (result[this.EDGES].hasOwnProperty(ciSysId) && result[this.EDGES][ciSysId].hasOwnProperty(this.REFERENCES)) {
				continue;
			}
			
			// Now we have all the ref CI edges for ciSysId, slap them on final payload
			if (!result[this.EDGES].hasOwnProperty(ciSysId)) {
				result[this.EDGES][ciSysId] = {};
				result[this.EDGES][ciSysId][this.REFERENCES] = [];
			}	
			
			var cis = [];
			var inputClassHierarchy = new GlideTableHierarchy(ciNodeInfo[ciSysId][this.PROPERTIES][this.SYS_CLASS_NAME][this.VALUE]).getTables();
			var refEdge = {}, revRefEdge = {}, ci = null;
			var refRecord = null, refs = null, refCis = null, refLabel = null;
			// Look for records where referenced_ci_class is input CI's class
			for (var i = 0; i < refMetadata.length; i++) {
				refRecord = refMetadata[i];
				if (arrayUtil.contains(inputClassHierarchy, refRecord.ci_class)) {
				
					// Query the table for this CI
					refs = this._getReferenceCis(refRecord.referenced_ci_class, refRecord.reference_field, ciSysId);
					refCis = refs['refCis'];
					refLabel = refs['label'];
					if (refCis.length > 0) {
						
						fetchedRefcount = fetchedRefcount + refCis.length;
						for (var n = 0; n < refCis.length; n++) {
							refEdge = this._newReferenceEdge(ciSysId, refCis[n], refLabel);
							transientState[this.REF_CI_VISITED][refCis[n]] = '';
							result[this.EDGES][ciSysId][this.REFERENCES].push(refEdge);
							if (!ciNodeInfo.hasOwnProperty(refCis[n]))
								newCis.push(refCis[n]);
						}
						
					}
				} else if (refRecord.show_reverse === '1' && (arrayUtil.contains(inputClassHierarchy, refRecord.referenced_ci_class))) {
					var reverseRef = this._getReverseReferenceCi(refRecord.referenced_ci_class, refRecord.reference_field, ciSysId);
					if (reverseRef[this.REF_CIS].length == 1) {
						ci = reverseRef[this.REF_CIS][0];
						revRefEdge = this._newReferenceEdge(ci, ciSysId, reverseRef[this.LABEL]);
						if (!result[this.EDGES].hasOwnProperty(ci)) {
							result[this.EDGES][ci] = {};
							result[this.EDGES][ci][this.REFERENCES] = [];
						}
						result[this.EDGES][ci][this.REFERENCES].push(revRefEdge);
						transientState[this.REF_CI_VISITED][ci] = '';
						fetchedRefcount++;
						
						if (!ciNodeInfo.hasOwnProperty(ci))
							newCis.push(ci);
					}
				}
			}
		}
		
		refResult[this.REF_EDGE_COUNT] = fetchedRefcount;
		refResult[this.REF_CIS] = newCis;
		
		return refResult;
	},
	
	_getReferenceMetadata: function(args) {
		var result = this.referenceDefintion;
		if (global.JSUtil.nil(result)) {
			var requestObject  = {
				appId: args.appId,
				configId: args.configIdentifierId,
				table: this.NODE_MAP_TABLE.NODE_MAP_CI_REF
			};
			var gr = this.configUtil.getApplicationConfigTable(requestObject);
			result = [];
			while(gr.next()) {
				var rec = {};
				rec[this.COL_CI_CLASS] = gr.getValue(this.COL_CI_CLASS);
				rec[this.COL_REF_CI_CLASS] = gr.getValue(this.COL_REF_CI_CLASS);
				rec[this.COL_REF_FIELD] = gr.getValue(this.COL_REF_FIELD);
				rec[this.COL_SHOW_REVERESE] = gr.getValue(this.COL_SHOW_REVERESE);

				result.push(rec);
			}
			this.referenceDefintion = result;
		}
		return result;
	},
	
	// eg: cmdb_ci_computer ----> col:cmdb_ci -----> Ref cmdb_ci_network_adapter
	// Given computer, display all network adapters for it
	_getReferenceCis: function(ciClass, refField, ciSysId) {
		var result = {};
		var gr = new GlideRecordSecure(ciClass);
		gr.addQuery(refField, ciSysId);
		gr.query();
		result[this.REF_CIS] = [];
		while (gr.next()) {
			if(global.JSUtil.nil(gr[this.COL_LIFE_CYCLE_STAGE])  || 
				this.LIFE_CYCLE_STAGE_INCLUSION_LIST.indexOf(gr[this.COL_LIFE_CYCLE_STAGE]) !== -1) {
					result[this.LABEL] = gr[refField].getLabel();
					result[this.REF_CIS].push('' + gr.getUniqueValue());
			}
		}
		return result;
	},
	
	// eg: cmdb_ci_network_adapter ----> col:cmdb_ci -----> Ref cmdb_ci_computer
	// Given network adapter, display its computer
	_getReverseReferenceCi: function(ciClass, refField, ciSysId) {
		var result = {};
		var gr = new GlideRecordSecure(ciClass);
		result[this.REF_CIS] = [];
		if (gr.get(ciSysId)) {
			if(global.JSUtil.nil(gr[this.COL_LIFE_CYCLE_STAGE]) || 
				this.LIFE_CYCLE_STAGE_INCLUSION_LIST.indexOf(gr[this.COL_LIFE_CYCLE_STAGE]) !== -1) {
					result[this.LABEL] = gr[refField].getLabel();
					var refFieldValue = gr.getValue(refField);
					if (!global.JSUtil.nil(refFieldValue)) {
						result[this.REF_CIS].push(refFieldValue);
					}
			}
		}
		return result;
	},

    type: 'MapReferenceCIService'
};
