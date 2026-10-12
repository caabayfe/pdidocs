ms.include("PrototypeServer");

var JDBCProbeErrorHandler = Class.create();
JDBCProbeErrorHandler.prototype = {

  initialize: function() {

  },

  process: function() {
    return "JDBCProbeError handled";
  },
    
  type: "JDBCProbeErrorHandler"
}
