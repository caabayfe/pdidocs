// flush this variable's cache since we changed the table descriptor
system.cacheFlush(current.name, true);
system.cacheFlush(current.getTableName());
