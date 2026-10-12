var tableName = 'cmdb_dedup_default_rel_item';
var indexName = 'whitelist_entry';

var start = new Date().getTime();
gs.info("CMDB - Update index of Default Rel Item: started.");

if (isUnique(tableName, indexName) && isValidToUpdate(tableName)){
  dropIndex(tableName, indexName);
  gs.info("CMDB - Update index of Default Rel Item: Index dropped for table " + tableName);
  addIndex(tableName, indexName);
  gs.info("CMDB - Update index of Default Rel Item: Index added for table " + tableName);
}

var end = new Date().getTime();
var duration = end - start;
gs.info("CMDB - Update index of Default Rel Item: took " + duration + " ms.");

function isValidToUpdate(tableName) {
  var maxSize = 5000000;
  var count = new GlideAggregate(tableName);
  //if isValid() == false - the table doesn't exists.
  if(!count.isValid()){
    gs.info("CMDB - Update index of Default Rel Item: table " + tableName + " doesn't exists");
    return false;
  }
  count.setWorkflow(false);
  count.addAggregate('COUNT');
  count.query();
  if(count.next()){
    var tableSize = count.getAggregate('COUNT');
    if(tableSize >= maxSize){
      gs.logWarning("CMDB - Update index of Default Rel Item: table " + tableName + " has size more than " + maxSize);
      gs.logWarning("CMDB - Update index of Default Rel Item: Skipped modifying index for " + tableName + " and column " + indexName);
      return false;
    }
  }
  return true;
}

function isUnique(tableName, indexName) {
  var isUnique = false;
  var td = new GlideTableDescriptor(tableName);
  td.getSchema();
  var indexes = td.getIndexDescriptors();
  for (var iter = indexes.values().iterator(); iter.hasNext();) {
    var idx = iter.next();
    if (idx.isPrimary())
    continue;
    var idxname = idx.getName();
    var unique = idx.isUnique();
    if (idxname == indexName && unique) {
      gs.info("CMDB - Update index of Default Rel Item: Unique Index " + indexName + " found");
      isUnique = true;
    }
    else {
      gs.info("CMDB - Update index of Default Rel Item: Index " + indexName + " is already non-unique");
    }
    td.close();
  }
  return isUnique;
}

function dropIndex(tableName, indexName) {
  var td = new GlideTableDescriptor(tableName);
  td.getSchema();
  var indexes = td.getIndexDescriptors();
  for (var iter = indexes.values().iterator(); iter.hasNext();) {
    var idx = iter.next();
    if (idx.isPrimary())
    continue;
    var idxname = idx.getName();
    if (idxname == indexName) {
      gs.info("CMDB - Update index of Default Rel Item: Index " + indexName + " found and will be dropped");
      var dbi = new GlideDBConfiguration.getDBI(tableName);
      gs.info(new GlideDBIndex(dbi).drop(idx));
      dbi.close();
    }
    td.close();
  }
}

function addIndex(appliesTo, attributes) {
  var columns = attributes.split(',');
  var grAppliesTo = new GlideRecord(appliesTo);
  for (var i in columns) {
    var column = columns[i];
    var elem = grAppliesTo.getElement(column);
    if (elem != null) {
      var table = elem.getTableName();
      var index = new IndexCreator(table, column, false, null, "identification");
      index.execute();
    } else {
      gs.logWarning("CMDB - Update index of Default Rel Item: Index not created for attribute '" + column + "' as it doesn't yet exist on table '" + appliesTo + "'");
    }
  }
}
