var sc = new SchemaCompare(current.target_database.prefix, current.sys_id);
sc.startCompare();
sc.close();
