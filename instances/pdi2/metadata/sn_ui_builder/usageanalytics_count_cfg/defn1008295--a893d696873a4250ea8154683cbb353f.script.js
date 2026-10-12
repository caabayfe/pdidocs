
            var collectionPropertyUsageByDataBroker = 0;

var gr = new GlideRecord('sys_ux_data_broker');
gr.addEncodedQuery('propsISNOTEMPTY');
gr.query();

while (gr.next()) {
    var properties = JSON.parse(gr.props);

    for(var i=0;i<properties.length; i++){
        if(properties[i].fieldType === 'collection'){
            collectionPropertyUsageByDataBroker++;
            break;
        }
    }
}

answer = collectionPropertyUsageByDataBroker;
