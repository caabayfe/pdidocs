var td = new GlideTableDescriptor(table_name);
answer = td.isUpdateSynch() || "sys_metadata" == table_name;
