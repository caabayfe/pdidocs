
            // Controller & UI controller

var collectionPropertyUsageByController = 0;

var gr = new GlideRecord('sys_ux_macroponent');
gr.addEncodedQuery('categoryINcontroller,ui_controller^props!=[]^props!=[ ]');
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
            collectionPropertyUsageByController++;
            break;
        }
    }
}

answer = collectionPropertyUsageByController;
