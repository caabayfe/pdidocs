getNodesInSameCluster();

function getNodesInSameCluster() {
  if (current == null)
      return;

  var cluster = current.cluster;
  if (!cluster)
      return;

  lookup.addQuery('cluster', cluster);
}
