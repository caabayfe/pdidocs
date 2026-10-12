
			var appTables = new GlideAggregate('ua_custom_table_inventory');
appTables.addAggregate('COUNT');
appTables.groupBy('app');
appTables.query();
var data = {}, count = 0;
while (appTables.next()) {
   var app = appTables.app.getDisplayValue();
   if(!app)
      app = "empty";
   data[app] = appTables.getAggregate('COUNT');
   count += parseInt(appTables.getAggregate('COUNT'));
}
var computedData = {count: count, data : data };
answer = new JSON().encode(computedData);
