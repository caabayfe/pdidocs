function transform(input) {
    var wrapperFn = function() {
      var util = new sn_cmdb_ws.CMDBWorkspaceUtil();

      var result = {
        properties: {}
      };

      if (input.properties && input.properties.length > 0) {
        var properties = input.properties.trim().split(',');
        properties.forEach(function(name) {
          switch (name) {
            case util.SYS_PROPERTIES_NAME.LIST_RECORD_COUNT_LIMIT.NAME:
              result.properties["LIST_RECORD_COUNT_LIMIT"] = util.getSystemProperty(util.SYS_PROPERTIES_NAME.LIST_RECORD_COUNT_LIMIT.NAME, util.DATATYPE.NUMBER, util.SYS_PROPERTIES_NAME.LIST_RECORD_COUNT_LIMIT.DEFAULT_VALUE);
              break;
			case util.SYS_PROPERTIES_NAME.LIST_RECORD_COUNT_LIMIT_EXCLUDED_TABLES.NAME:
				result.properties["LIST_RECORD_COUNT_LIMIT_EXCLUDED_TABLES"] = util.getSystemProperty(util.SYS_PROPERTIES_NAME.LIST_RECORD_COUNT_LIMIT_EXCLUDED_TABLES.NAME, util.DATATYPE.STRING, util.SYS_PROPERTIES_NAME.LIST_RECORD_COUNT_LIMIT_EXCLUDED_TABLES.DEFAULT_VALUE);
              break;
            default:
              result.properties[name] = gs.getProperty(name);
              break;
          }
        });
      }
      return result;
    };

    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws", "CMDB WS Get System Properties Values", wrapperFn);
}
