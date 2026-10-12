(function executeRule(current, previous /*null when async*/ ) {
    if (current.filter != new sn_ais.AisUtil().getTableLevelAttribute(current.source, 'filter', '')) {
        var filterRecord = new GlideRecord('ais_datasource_attribute');
        filterRecord.addQuery('datasource', current.getUniqueValue());
        filterRecord.addQuery('attribute', 'd7945a48c7c41010d1cfd9795cc2606d');
        filterRecord.query();
		var count = filterRecord.getRowCount();
        if (count > 1)
            gs.info("Unexpected number of filters created for datasource: " + current.getUniqueValue());
		if (count < 1) {
			var newFilter = new GlideRecord('ais_datasource_attribute');
			newFilter.setValue('attribute', 'd7945a48c7c41010d1cfd9795cc2606d');
			newFilter.setValue('datasource', current.getUniqueValue());
			newFilter.setValue('source', current.source);
			newFilter.setValue('value', current.filter);
			newFilter.update();
		} else {
			while (filterRecord.next()) {
				var id = filterRecord.getUniqueValue();
				filterRecord.setValue('value', current.filter);
				filterRecord.update();
			}
				
		}
    }

})(current, previous);
