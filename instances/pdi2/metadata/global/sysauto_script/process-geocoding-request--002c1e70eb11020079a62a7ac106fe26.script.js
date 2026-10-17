var geocodingRequest = new GlideRecord("sys_geocoding_request");
geocodingRequest.orderBy("sys_created_on");
geocodingRequest.setLimit(1);
geocodingRequest.query();
if(geocodingRequest.next()){
	var point = GoogleMapsHelper.google_getLatLong(geocodingRequest.address);
	if (point[0] && point[1]){
		var locationRecord = new GlideRecord(geocodingRequest.record_table);
		locationRecord.addQuery("sys_id", geocodingRequest.record);
		locationRecord.query();
		if(locationRecord.next()){
			locationRecord.latitude = point[0];
			locationRecord.longitude = point[1];
			locationRecord.update();
		}
	}
	geocodingRequest.deleteRecord();
}
