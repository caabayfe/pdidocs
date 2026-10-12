
			// Events

var collectionPropertyUsageByEvent = 0;

var gr = new GlideRecord('sys_ux_event');
gr.addEncodedQuery('props!=[]^props!=[ ]');
gr.query();

while (gr.next()) {
    var properties;

	try{
		properties = JSON.parse(gr.props);
	}
	catch(err){
		gs.error(gr.event_name);
		gs.error(JSON.stringify(err));
		properties = [];
	}

    for(var i=0;i<properties.length; i++){
        if(properties[i].fieldType === 'collection'){
            collectionPropertyUsageByEvent++;
            break;
        }
    }
}

answer = collectionPropertyUsageByEvent;
