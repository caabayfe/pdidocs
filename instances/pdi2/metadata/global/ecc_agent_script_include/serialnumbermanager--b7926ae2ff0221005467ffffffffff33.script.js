// Discovery

var SerialNumberManager = Class.create();

SerialNumberManager.prototype = {
  initialize : function() {
      this._serials = {};
      this._serialArray = [];
  },

  add: function(sType, value) {
      if (JSUtil.nil(value))
          return;

      this._serials[sType] = value;
      this._serialArray.push(value);
  },
	
  getSerialArray: function() {
      return this._serialArray;
  },
	
  getSerialsForCIData: function() {
      var srlArray = [];
      for (var sType in this._serials) {
          var value = this._serials[sType];

          var sr = {};
          sr['serial_number_type'] = sType;
          sr['serial_number']      = value;

          srlArray.push(sr);
      }
          
      return srlArray;
  },

}
