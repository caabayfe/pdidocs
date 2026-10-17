var PayloadLoaderUtil = Class.create();
PayloadLoaderUtil.prototype = {
    initialize: function() {
    },

	replaceFieldValue: function(tableName, fieldName, payload, changePayload, prefixCount){
		var xmlDoc = new XMLDocument2();
		var isXmlValid = xmlDoc.parseXML(payload); 

		if(isXmlValid) {
			var fieldValue = xmlDoc.getNodeText("//" + fieldName);

			if(fieldValue) {
				var gr = new GlideRecord(tableName);
				gr.addQuery(fieldName, fieldValue);
				gr.query();
				var count = gr.getRowCount();

				if(count == 0){
					return payload;
				}

				while(gr.next()){
					count++;
					gr = new GlideRecord(tableName);
					
					if(prefixCount)
						gr.addQuery(fieldName, count + "_" + fieldValue);
					else
						gr.addQuery(fieldName, fieldValue + "_" + count);
						
					gr.query();

					if(!gr.hasNext()) {
						
						if(changePayload) {
							params = {};
							params.fieldName = fieldName;
							params.fieldValue = fieldValue;
							params.count = count;
							params.xmlDoc = xmlDoc;
							params.payload = payload;
							
							payload = changePayload(params);
							
						} else{
							var oldField = "<" + fieldName + ">" + fieldValue + "</" + fieldName + ">";
							var newField = "<" + fieldName + ">" + fieldValue + "_" + count + "</" + fieldName + ">";
							payload = payload.replace(oldField, newField);
						}
						
						return payload;
					}
				}
			}
		}
		
		return payload;
	},
	
	isStarterExperience: function(variables) {
		var starter_experience = "starter_experience";
		
		if(!variables)
			return false;
		
		return variables.getValue(starter_experience) == starter_experience ? true : false;
	},
	
    type: 'PayloadLoaderUtil'
};
