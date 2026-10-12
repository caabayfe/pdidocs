var gr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
answer = (new PDACLUtils()).contentFilteringCanRead(gr);
