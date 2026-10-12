var ApplicationServiceMapAPI = Class.create();
ApplicationServiceMapAPI.prototype = {
    initialize: function() {
    },

	_getFullCiData: function(ciList, timestamp, bsId) {
		var data = new sn_itservice.ScopedSmServiceMapApi().getFullCiData(ciList, timestamp, bsId);
		data = JSON.parse(data);
		return data;
	},

	getCiHostData: function(ciId, ciStableId, timestamp, bsId) {
		var ciMap = {};
		ciMap[ciId] = ciStableId;

		var ciData = this._getFullCiData(ciMap, timestamp, bsId)[0];

		var name = {};
		name['label'] = ciData.serverData.scalarAttrs.name.label;
		name['value'] = ciData.serverData.scalarAttrs.name.value;

		var serial_number = {};
		serial_number['label'] = ciData.serverData.scalarAttrs.serial_number.label;
		serial_number['value'] = ciData.serverData.scalarAttrs.serial_number.value;

		var ci_type = {};
		ci_type['label'] = ciData.serverData.scalarAttrs['CI Type'].label;
		ci_type['value'] = ciData.serverData.scalarAttrs['CI Type'].value;

		var ci_class = {};
		ci_class['label'] = ciData.serverData.scalarAttrs['Class'].label;
		ci_class['value'] = ciData.serverData.scalarAttrs['Class'].value;

		var hostData = [];
		if(name['value'] != "") hostData.push(name);
		if(serial_number['value'] != "") hostData.push(serial_number);
		if(ci_type['value'] != "") hostData.push(ci_type);
		if(ci_class['value'] != "") hostData.push(ci_class);

		return hostData;

	},

    type: 'ApplicationServiceMapAPI'
};
