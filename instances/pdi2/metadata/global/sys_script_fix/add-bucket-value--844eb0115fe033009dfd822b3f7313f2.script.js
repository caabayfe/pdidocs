//map: bucket -> [service sys ids array]
var bucketMap = {};
var bucketCalculator = new EmBucketCalculator();
var gr = new GlideRecord("cmdb_ci_service_auto");
gr.addNullQuery("bucket");
gr.query();

var start = new Date().getTime();
//iterate by services and calculate bucket
while (gr.next()){
    var bucket = bucketCalculator.calculateBucket(gr);
    var sysId = gr.getUniqueValue();
    var sysIds = [];
    if(bucketMap[bucket]){
        sysIds = bucketMap[bucket];
    }
    sysIds.push(sysId);
    bucketMap[bucket] = sysIds;
}

new EvtMgmtCommons().updateBucketForBSAndImpactGraph(bucketMap);

var updateIG = new GlideMultipleUpdate("em_impact_graph");
updateIG.addNullQuery("status");
updateIG.setValue("status", "Valid");
updateIG.execute();

var end = new Date().getTime();
var duration = end - start;
gs.info("Add bucket value to services and impact graph took " + duration + " ms.");
