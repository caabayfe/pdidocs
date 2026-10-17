// Discovery
var DiscoveryCIRelationReconciler = Class.create();

DiscoveryCIRelationReconciler._INSTALL_STATUS = 'install_status';
DiscoveryCIRelationReconciler._INSTALL_STATUS_ABSENT = 100;

DiscoveryCIRelationReconciler.prototype = {
	/**
	 * Optionally, pass a single parameters object using the same names.
	 * Extended options:
	 *   string direction: Specifies whether the fromId is the 'downstream' or 'upstream'. Default 'upstream'.
	 * 
	 * @param string fromId The sys_id of the CI to be related from (the 'one' in one:many)
	 * @param string nature The relationship type descriptor
	 * @param string toTable The table that of CIs to be related
	 * @param CIData[] cidata The array of CIs to create/update and relate to. (the 'many' in one:many)
	 * @param string[] keys Fields that make up a unique identity when related to the fromCi.
	 * @param boolean retireMissing If TRUE, CIs of the same type that are related, but do not match the CIs specified, will be marked absent.
	 * @param string reason Used as the update() message for GlideRecord writes.
	 */
    initialize: function(fromId, nature, toTable, cidata, keys, retireMissing, reason) {
		if (typeof nature !== 'undefined') {
			this._fromId = fromId;
			this._nature = nature;
			this._relationTypeId = g_disco_functions.findCIRelationshipType('cmdb_rel_type', nature);			
			this._table = toTable;
			this._keys = keys;
			this._retireMissing = retireMissing;
			this._reason = reason;
			this._originalCiDataArray = cidata;
			this._direction = 'downstream'
		} else {
			var options = fromId;
			this._fromId = options.fromId;
			this._nature = options.nature;
			this._relationTypeId = g_disco_functions.findCIRelationshipType('cmdb_rel_type', options.nature);			
			this._table = options.toTable;
			this._keys = options.keys;
			this._retireMissing = options.retireMissing;
			this._reason = options.reason;
			this._originalCiDataArray = options.cidata;
			this._direction = ( typeof options.direction !== 'undefined' ? options.direction : 'downstream' );
		}
		
		if (gs.nil(this._relationTypeId))
			throw new IllegalArgumentException('Unable to reconcile for specified relation type ' + nature);
		
		this._cidataArray = []; // may contain null values
		
		// copy so that we can skip invalid cis without altering original array
		for (var i = 0, n = this._originalCiDataArray.length; i < n; ++i) {
			if (this._originalCiDataArray[i] === null || !this._cidataHasKeys(this._originalCiDataArray[i]))
				this._cidataArray.push(null); // prevent this ci from being found in other steps
			else
				this._cidataArray.push(this._originalCiDataArray[i]);
		}
    },

    reconcile: function() {
		this._writeCIs();
		this._retireMissingCIs();
    },
   
	/**
 	* Inserts/Updates all CIs provided, updating the original CI object with the appropriate ID.
	 */
	_writeCIs: function() {
		for (var i = 0, n = this._cidataArray.length; i < n; ++i) {
			if (this._cidataArray[i] === null)
				continue;
		   
			// insert/update the ci
			var cidata = this._cidataArray[i];
			var ci = this._findCi(cidata);
			this._write(cidata, ci);
			this._originalCiDataArray[i].data.sys_id = cidata.data.sys_id; // update the passed reference with the sysid
			var parentId = ( this._direction === 'downstream' ? this._fromId : cidata.data.sys_id );
			var childId = ( this._direction === 'downstream' ? cidata.data.sys_id : this._fromId );
			new DiscoveryFunctions().createRelationshipIfNotExists(parentId, childId, this._nature);
		}
	},
   
	/**
	 * Scans all relationships of the same type and classname from the origin for CIs that are not in our list
	 * and retires those missing CIs.
	 */
	_retireMissingCIs: function() {
		if (!this._retireMissing)
			return;
	   
		var fromField = ( this._direction === 'downstream' ? 'child' : 'parent' );
		var toField = ( this._direction === 'downstream' ? 'parent' : 'child' );
		
		var relations = new GlideRecord('cmdb_rel_ci');
		relations.addQuery(fromField, this._fromId);
		relations.addQuery(toField + '.sys_class_name', this._table);
		relations.addQuery('relation', this._relationTypeId);
		relations.query();

		while(relations.next()) {
			var ci = new GlideRecord(this._table);
			if (!ci.get(''+relations[toField]))
				continue;
		   
			if (this._findIndex(ci) === null)
				this._retire(ci);
		}
 	},
	  
	/**
 	* Expects cidata to have all keys necessary.
 	* @param CIData cidata
	 * @returns GlideRecord|null
 	*/
	_findCi: function(cidata) {
		var query = new GlideRecord(this._table);
		for (var ki = 0, kn = this._keys.length; ki < kn; ++ki) {
			var key = this._keys[ki];
			var value = cidata.data[key];
			query.addQuery(key, value);
		}
	   
		query.query();
		if (query.next())
		   return query;
	   
	   return null;
	},

   
	/**
	 * Verifies that CIData has all of the specified keys to match on.
	 * @param cidata CIData
	 * @param [string] keys A list of keys to check
	 * @returns TRUE if valid, FALSE if no keys are set
	 */
	_cidataHasKeys: function(cidata, keys) {
		var data = cidata.data;
		for (var i = 0, n = keys.length; i < n; ++i) {
			if (gs.nil(data[keys[i]]))
				return false;
		}
	   
		return true;
	},
		
	_findIndex: function(ci) {
		var values = []; // build values. will be Java strings, so we use equals() later
		for (var ki = 0, kn = this._keys.length; ki < kn; ++ki) // kn is reused later
			values.push(ci.getValue(this._keys[ki])); // Java String

		var data = null;
		for (var i = 0, n = this._cidataArray.length; i < n; ++i) {
			if (this._cidataArray[i] === null) // already done
				continue;
 			
			data = this._cidataArray[i].data;
			var skipped = false;
			for (ki = 0; ki < kn; ++ki) { // reusing kn
				if (gs.nil(values[ki]) || !values[ki].equals(data[this._keys[ki]])) {
					skipped = true;
					break;
				}
			}		
		   
			if (!skipped)
				return i;
		}
		
		return null;
	},

	_retire: function(ci) {
		ci.setValue(DiscoveryCIRelationReconciler._INSTALL_STATUS, DiscoveryCIRelationReconciler._INSTALL_STATUS_ABSENT);
		ci.update(this._reason);
	},
	
	/**
	 * Expects cidata for index to have all keys.
	 * @param ci GlideRecord|null
	 */
	_write: function(cidata, ci) {
		var isNew = ( ci === null );
		if (isNew)
			ci = new GlideRecord(this._table);
	   
		var data = cidata.data;
		for (var name in data)
			ci.setValue(name, data[name]);

		if (isNew) {
			data.sys_id = ''+ci.insert(this._reason);
		} else {
			ci.update(this._reason);
			data.sys_id = ''+ci.sys_id;
		}
	},

    type: 'DiscoveryCIRelationReconciler'
};
