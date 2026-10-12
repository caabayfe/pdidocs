// Purge expired permalinks (sys_date > expiration date + retention_days_after_expiry)
new sn_doc_services.DocumentPermalinkAPI().cleanExpiredPermalinks();
