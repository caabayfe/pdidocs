initializeSharding();

function initializeSharding() {
   var model = current.name.toString();
   var numShards = getNumberOfShards();
   var ts = new SNC.TableRotationUtil();

   for (var i = 1; i <= numShards; i++) {
      var shardName = ts.create(model);      
      var shard = addShardEntry(shardName);
   }  

   var gr = new GlideRecord(current.getTableName());
   gr.get(current.sys_id);
   gr.initialized = true;
   gr.update();

   GlideCacheManager.flush("table_rotation_shard");
} 

function getNumberOfShards() {
   if (current.shards.isNil())
      return 16;

   return current.getValue('shards');
}

function addShardEntry(shardName) {
   var shard = new GlideRecord('sys_table_shard');
   shard.name = current.sys_id;
   shard.table_name = shardName;
   shard.insert();

   return shard;
}
