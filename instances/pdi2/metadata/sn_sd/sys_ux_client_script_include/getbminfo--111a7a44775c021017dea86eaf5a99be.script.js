async function include({imports},helpers,url) {
url = '/api/sn_bm_client/benchmark_client_api/'+url;
var response = await helpers.snHttp(url,{
method: 'GET',
body: {}
});
return response;
}
