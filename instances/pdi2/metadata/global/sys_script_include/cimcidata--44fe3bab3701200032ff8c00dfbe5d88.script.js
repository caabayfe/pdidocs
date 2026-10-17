// Discovery
/**
 * Wrapper for CIM CI data manipulation.
 * @author roy.laurie
 */
var CimCIData = Class.create();

/**
 * For use with out-of-the-box use of addSerial().
 */
CimCIData.serialType = {
    	psnt: 'psnt',
	chassis: 'cim_chassis',
	partNumber: 'part_number'
};

CimCIData.isValueValid = function(name) {
	if (gs.nil(name))
		return false;

	if (name.match(/unknown|empty/i))
		return false;

	return true;
};

CimCIData.prototype = {
	SerialRecord: function(type, serial) {
		this.serial_number_type = type;
		this.serial_number = serial;
		this.valid = true;
	},
	
	/**
	 * @param CIData cidata
	 */
    initialize: function(cidata) {
		this.cidata = cidata;
		this.data = this.cidata.data;
		this.serials = null;
		this.serialMap = { };
    },
	
	/**
	 * Adds a serial to this CI, by type.
	 * @param string type If out-of-box, use enum CimCIData.serialType.
	 * @param string serial
	 */
	addSerial: function(type, serial) {
		// validate
		if (gs.nil(type))
			return;

		if (!CimCIData.isValueValid(serial))
			return;
		
		var sn = new SncSerialNumber();
		if (!sn.isValid(serial))
			return;
		
		if (this.serials === null)
			this._initSerials();
		if (this.cidata.data.serial_number === null)
			this.cidata.data.serial_number = serial;

		this.serialMap[type] = this.serialMap[type] || { };
		if (this.serialMap[type][serial])
			return;
		this.serialMap[type][serial] = true;

		var record = new this.SerialRecord(type, serial);
		this.serials.addRec(record);		
		return this;
	},

	_initSerials: function() {
		// create a related instance if one does not already exist
		this.serials = this.cidata.getRelatedListInstance('cmdb_serial_number', 'cmdb_ci');
		if (this.serials === null) {
			this.serials = new CIRelatedList('cmdb_serial_number', 'cmdb_ci', this.cmdb_ci, this.debug_flag);
			this.cidata.addRelatedList(this.serials);
		}
		
		if (this.cidata.data.serial_number === undefined)
			this.cidata.data.serial_number = null;
	},
	
	setMakeAndModel: function(make, model) {
		if (!CimCIData.isValueValid(make))
			make = '';
		if (!CimCIData.isValueValid(model))
			model = '';
		var ecmdbMakeModel = MakeAndModelJS.fromNames(make, model, 'hardware');
		this.cidata.data.manufacturer = ''+ecmdbMakeModel.getManufacturerSysID();
		this.cidata.data.model_id = ''+ecmdbMakeModel.getModelNameSysID();
	},
	
    type: 'CimCIData'
};
