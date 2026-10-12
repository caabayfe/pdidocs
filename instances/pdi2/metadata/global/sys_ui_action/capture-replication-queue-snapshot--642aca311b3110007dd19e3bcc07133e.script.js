var builder = new SncHAReplicationQueueSnapshotBuilder();
builder.loadFromChunk(current.sys_id);
builder.buildSnapshots();
