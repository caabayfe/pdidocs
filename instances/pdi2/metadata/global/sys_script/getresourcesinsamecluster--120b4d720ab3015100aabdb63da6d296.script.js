getNodesInSameCluster();

function getNodesInSameCluster() {
  var cluster = current.cluster;
  if (!cluster)
      return;

  lookup.addQuery('cluster', cluster);
}
