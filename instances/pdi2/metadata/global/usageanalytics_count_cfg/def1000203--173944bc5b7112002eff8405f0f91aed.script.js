answer = getCustomTablesByScopedCustomApplications();

function getCustomTablesByScopedCustomApplications() {
    var customTables = -1;
	var prefix = 'x_';
	var prefixSeperator = '_';
    
	if (!GlideTableDescriptor.isValid('sys_db_object') )
		return customTables;
	
	var companyCode = gs.getProperty('glide.appcreator.company.code');
	if (GlideStringUtil.nil(companyCode))
		return customTables;
	var vendorPrefix = prefix + companyCode + prefixSeperator;
	
	var gr = new GlideAggregate('sys_db_object');
	gr.addQuery('name', 'STARTSWITH', vendorPrefix);
	gr.addAggregate('COUNT');
	gr.query();

	if (gr.next()) 
		customTables = parseInt(gr.getAggregate('COUNT'));
    return customTables ;
}
