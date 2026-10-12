// we intentionally check it the "wrong" way (instead of using hasRightsTo), because of the way our content filtering works for sys_pd_process_type/sys_pd_process_definition
answer = (new GlideRecord("sys_pd_process_type")).canRead();
