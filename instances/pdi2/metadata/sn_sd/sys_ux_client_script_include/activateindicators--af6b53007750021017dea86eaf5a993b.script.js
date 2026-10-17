async function include({imports},helpers,allIndicators,sysId,optInStatus) {

var bodyObj = {};

for(var i=0; i< allIndicators.length; i++){
       if( allIndicators[i].sys_id ==  sysId )  bodyObj[allIndicators[i].sys_id] = (optInStatus == 'optIn' ? true: false);
      else bodyObj[allIndicators[i].sys_id]  =  (allIndicators[i].active.value =='true' ? true : false);
}

bodyObj = JSON.stringify(bodyObj);

var response = await helpers.snHttp('api/sn_bm_client/benchmark_client_api/activateIndicators',{
method: 'POST',
body: {
"indicators" :  bodyObj
}
});

return response;
}
