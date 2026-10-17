async function script({ api, event, helpers, imports }) {
     //fetchConnectionPropsCompleted in (CI) Properties UI Controller; 
     //Fired after get_sm_connection_properties data broker finishes
     var data = api.data?.get_sm_connection_properties?.output;
     const { buildStackedValueObj, PROP_CLASS, CONNECTION_EXCLUSION_FIELDS } = imports["sn_cmdb_ws.unifiedMapPropertiesUtils"]();
     const ENDPOINT_TYPE = await helpers.translate("Endpoint Type");
     const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
    
     //Filter list for fields are not needed on the UI
     var exclusions = [CONNECTION_EXCLUSION_FIELDS.COMMENTS,
          CONNECTION_EXCLUSION_FIELDS.ATTACHMENT_INFO,
          CONNECTION_EXCLUSION_FIELDS.COMMAND_LINE_PARAMETERS,
          CONNECTION_EXCLUSION_FIELDS.STORAGE_PATH,
          CONNECTION_EXCLUSION_FIELDS.COMMAND_LINE ].map((e) => e.toLowerCase());

     if(data) {
          var connectionProperties =  cloneDeep(api.state.ciConnectionProperties);
          var cards = connectionProperties.cards;
          cards.forEach((card, index) => {
               var extendedFieldOutput = [];
               if(data.edgePropsList?.[card.epId]) {
                    var props = data.edgePropsList[card.epId];
                    for (const [key, value] of Object.entries(props)) {
                         var label = key;
                         //For "Class" we want to show the "Endpoint type" text on the UI to match what service mapping has
                         if(key === PROP_CLASS) {
                              extendedFieldOutput.unshift(buildStackedValueObj(ENDPOINT_TYPE, value || api.state.translations.NONE));
                         } else if(!exclusions.includes(key.toLowerCase())){
                              extendedFieldOutput.push(buildStackedValueObj(label, value || api.state.translations.NONE));
                         }
                    }
               }
               cards[index].extendedField = extendedFieldOutput;
               cards[index].hasExtendedFields = true;
          });
          connectionProperties.cards = cards;
          api.setState("ciConnectionProperties", connectionProperties);
     }
     
}
