
			var collectionPropertyUsageByComponent = 0;

var gr = new GlideRecord('sys_ux_macroponent');
gr.addEncodedQuery('category=component^props!=[]^props!=[ ]');
gr.query();

while (gr.next()) {
    var properties;

	try{
		properties = JSON.parse(gr.props);
	}
	catch(err){
		gs.error(gr.name);
		gs.error(JSON.stringify(err));
		properties = [];
	}

    for(var i=0;i<properties.length; i++){
        if(properties[i].fieldType === 'collection'){
            collectionPropertyUsageByComponent++;
            break;
        }
    }
}

answer = collectionPropertyUsageByComponent;
