//API: renameTable(tableName, previousLabel, targetLabel, plural)
//     changeHint(tableName, previousHint, targetHint);

gs.log("Changing labels of CMDB tables for J release");

//PRB711807 - Endpoint labels are not expressing the fact these are endpoint.

renameTable("cmdb_ci_endpoint_mysql_cl_dn", "MySQL Cluster Data Node", "MySQL Cluster Data Node Endpoint", "MySQL Cluster Data Node Endpoints");
renameTable("cmdb_ci_endpoint_msmq", "MSMQ Flow", "MSMQ Flow Endpoint", "MSMQ Flow Endpoints");
renameTable("cmdb_ci_endpoint_ent_vault", "Enterprise Vault EP", "Enterprise Vault Endpoint", "Enterprise Vault Endpoints");
renameTable("cmdb_ci_endpoint_ldap", "LDAP", "LDAP Endpoint", "LDAP Endpoints");
renameTable("cmdb_ci_endpoint_sap_app", "SAP APP EP", "SAP APP Endpoint", "SAP APP Endpoints");
renameTable("cmdb_ci_endpoint_fromcluster_t", "FromCluster_to_RabbitMQ", "FromCluster_to_RabbitMQ Endpoint", "FromCluster_to_RabbitMQ Endpoints");
renameTable("cmdb_ci_endpoint_f5", "F5 Mirror", "F5 Mirror Endpoint", "F5 Mirror Endpoints");
renameTable("cmdb_ci_endpoint_postgresql", "PostgreSQL DB", "PostgreSQL DB Endpoint", "PostgreSQL DB Endpoints");
renameTable("cmdb_ci_endpoint_dctm_broker", "DCTM Connection to broker", "DCTM Connection to broker Endpoint", "DCTM Connection to broker Endpoints");
renameTable("cmdb_ci_endpoint_ejb", "EJB", "EJB Endpoint", "EJB Endpoints");
renameTable("cmdb_ci_endpoint_ctg", "CTG", "CTG Endpoint", "CTG Endpoints");
renameTable("cmdb_ci_endpoint_ssas", "SSAS", "SSAS Endpoint", "SSAS Endpoints");
renameTable("cmdb_ci_endpoint_fastsearch", "Fast Search", "Fast Search Endpoint", "Fast Search Endpoints");
renameTable("cmdb_ci_endpoint_mq", "MQ", "MQ Endpoint", "MQ Endpoints");
renameTable("cmdb_ci_endpoint_mapi_hub", "MAPI-HUB", "MAPI-HUB Endpoint", "MAPI-HUB Endpoints");
renameTable("cmdb_ci_endpoint_hpom", "HPOM", "HPOM Endpoint", "HPOM Endpoints");
renameTable("cmdb_ci_endpoint_db2sql", "DB2 UDB", "DB2 UDB Endpoint", "DB2 UDB Endpoints");
renameTable("cmdb_ci_endpoint_ad_domain", "Active Directory Domain to Domain Controllers", "Active Directory Domain to Domain Controllers Endpoint", "Active Directory Domain to Domain Controllers Endpoints");
renameTable("cmdb_ci_endpoint_xenapp_comp", "XenApp or Presentation Server Components", "XenApp or Presentation Server Components Endpoint", "XenApp or Presentation Server Components Endpoints");
renameTable("cmdb_ci_endpoint_ajp", "AJP", "AJP Endpoint", "AJP Endpoints");
renameTable("cmdb_ci_endpoint_ssas_mssql", "SSAS for MSSQL", "SSAS for MSSQL Endpoint", "SSAS for MSSQL Endpoints");
renameTable("cmdb_ci_endpoint_imap", "IMAP", "IMAP Endpoint", "IMAP Endpoints");
renameTable("cmdb_ci_endpoint_smtp", "SMTP", "SMTP Endpoint", "SMTP Endpoints");
renameTable("cmdb_ci_endpoint_app_storage", "Application To Storage", "Application To Storage Endpoint", "Application To Storage Endpoints");
renameTable("cmdb_ci_endpoint_tbco_confile", "Tibco Conf File", "Tibco Conf File Endpoint", "Tibco Conf File Endpoints");
renameTable("cmdb_ci_endpoint_storage_fc", "Storage FC Connectivity", "Storage FC Connectivity Endpoint", "Storage FC Connectivity Endpoints");
renameTable("cmdb_ci_endpoint_rabbitmq", "RabbitMQ EP", "RabbitMQ Endpoint", "RabbitMQ Endpoints");
renameTable("cmdb_ci_endpoint_docbase", "DocBase Connection", "DocBase Connection Endpoint", "DocBase Connection Endpoints");
renameTable("cmdb_ci_endpoint_ems_jndi", "EMS JNDI", "EMS JNDI Endpoint", "EMS JNDI Endpoints");
renameTable("cmdb_ci_endpoint_tcp", "TCP", "TCP Endpoint", "TCP Endpoints");
renameTable("cmdb_ci_endpoint_ssis_mssql", "SSIS for MSSQL", "SSIS for MSSQL Endpoint", "SSIS for MSSQL Endpoints");
renameTable("cmdb_ci_endpoint_mysql_server", "MySQL Server", "MySQL Server Endpoint", "MySQL Server Endpoints");
renameTable("cmdb_ci_endpoint_dctm_index", "DCTM Index Agent Connection", "DCTM Index Agent Connection Endpoint", "DCTM Index Agent Connection Endpoints");
renameTable("cmdb_ci_endpoint_nntp", "NNTP", "NNTP Endpoint", "NNTP Endpoints");
renameTable("cmdb_ci_endpoint_ms_sql_server", "MS SQL Server EP", "MS SQL Server Endpoint", "MS SQL Server Endpoints");
renameTable("cmdb_ci_endpoint_dctm_job", "DCTM Job Processor", "DCTM Job Processor Endpoint", "DCTM Job Processor Endpoints");
renameTable("cmdb_ci_endpoint_oracle_rac", "Oracle RAC DB", "Oracle RAC DB Endpoint", "Oracle RAC DB Endpoints");
renameTable("cmdb_ci_endpoint_sybase", "Sybase", "Sybase Endpoint", "Sybase Endpoints");
renameTable("cmdb_ci_endpoint_iifp", "IIFP", "IIFP Endpoint", "IIFP Endpoints");
renameTable("cmdb_ci_endpoint_network", "Network EP", "Network Endpoint", "Network Endpoints");
renameTable("cmdb_ci_endpoint_itam", "ITAM Asset Center EP", "ITAM Asset Center Endpoint", "ITAM Asset Center Endpoints");
renameTable("cmdb_ci_endpoint_tibco_file", "Tibco File Listener", "Tibco File Listener Endpoint", "Tibco File Listener Endpoints");
renameTable("cmdb_ci_endpoint_mq_mem", "MQ Cross-memory", "MQ Cross-memory Endpoint", "MQ Cross-memory Endpoints");
renameTable("cmdb_ci_endpoint_ftp", "FTP", "FTP Endpoint", "FTP Endpoints");
renameTable("cmdb_ci_endpoint_aq", "Advanced Queue", "Advanced Queue Endpoint", "Advanced Queue Endpoints");
renameTable("cmdb_ci_endpoint_biztalk", "BizTalk Connection", "BizTalk Connection Endpoint", "BizTalk Connection Endpoints");
renameTable("cmdb_ci_endpoint_tibco_hawk", "Tibco Hawk EP", "Tibco Hawk Endpoint", "Tibco Hawk Endpoints");
renameTable("cmdb_ci_endpoint_mq_flow", "MQ Flow", "MQ Flow Endpoint", "MQ Flow Endpoints");
renameTable("cmdb_ci_endpoint_rfc", "RFC", "RFC Endpoint", "RFC Endpoints");
renameTable("cmdb_ci_endpoint_oracle_db", "Oracle DB", "Oracle DB Endpoint", "Oracle DB Endpoints");
renameTable("cmdb_ci_endpoint_sap", "SAP Application Server EP", "SAP Application Server Endpoint", "SAP Application Server Endpoints");
renameTable("cmdb_ci_endpoint_sp_connection", "Sharepoint connection", "Sharepoint connection Endpoint", "Sharepoint connection Endpoints");
renameTable("cmdb_ci_endpoint_rabbitmq_queu", "RabbitMQ Queue EP", "RabbitMQ Queue Endpoint", "RabbitMQ Queue Endpoints");
renameTable("cmdb_ci_endpoint_ems", "EMS", "EMS Endpoint", "EMS Endpoints");
renameTable("cmdb_ci_endpoint_tibco_bw", "Tibco BW", "Tibco BW Endpoint", "Tibco BW Endpoints");
renameTable("cmdb_ci_endpoint_remote_tcp", "Remote TCP Cross-memory", "Remote TCP Cross-memory Endpoint", "Remote TCP Cross-memory Endpoints");
renameTable("cmdb_ci_endpoint_peoplesoft", "Peoplesoft Application Server EP", "Peoplesoft Application Server Endpoint", "Peoplesoft Application Server Endpoints");
renameTable("cmdb_ci_endpoint_jms_server", "JMS Server", "JMS Server Endpoint", "JMS Server Endpoints");
renameTable("cmdb_ci_endpoint_wmb_depend", "WMB Dependency", "WMB Dependency Endpoint", "WMB Dependency Endpoints");
renameTable("cmdb_ci_endpoint_mysql_slave", "MySQL Slave Server", "MySQL Slave Server Endpoint", "MySQL Slave Server Endpoints");
renameTable("cmdb_ci_endpoint_obj_cms_srv", "Business Objects CMS Server", "Business Objects CMS Server Endpoint", "Business Objects CMS Server Endpoints");
renameTable("cmdb_ci_endpoint_ad_forest", "Active Directory Forest", "Active Directory Forest Endpoint", "Active Directory Forest Endpoints");
renameTable("cmdb_ci_endpoint_oracle_esb", "Oracle ESB Connection", "Oracle ESB Connection Endpoint", "Oracle ESB Connection Endpoints");
renameTable("cmdb_ci_endpoint_mapi", "MAPI", "MAPI Endpoint", "MAPI Endpoints");
renameTable("cmdb_ci_endpoint_vm_esx", "VirtualMachine to ESX Storage", "VirtualMachine to ESX Storage Endpoint", "VirtualMachine to ESX Storage Endpoints");
renameTable("cmdb_ci_endpoint_pop3", "POP3", "POP3 Endpoint", "POP3 Endpoints");
renameTable("cmdb_ci_endpoint_mysql_cl_mg", "MySQL Cluster MGM", "MySQL Cluster MGM Endpoint", "MySQL Cluster MGM Endpoints");
renameTable("cmdb_ci_endpoint_ssis_file", "SSIS file", "SSIS file Endpoint", "SSIS file Endpoints");
renameTable("cmdb_ci_endpoint_listener_wmb", "HTTP Listener to WMB Dependency", "HTTP Listener to WMB Dependency Endpoint", "HTTP Listener to WMB Dependency Endpoints");
renameTable("cmdb_ci_endpoint_ssis", "SSIS", "SSIS Endpoint", "SSIS Endpoints");
renameTable("cmdb_ci_endpoint_crm", "CRM Component", "CRM Component Endpoint", "CRM Component Endpoints");
renameTable("cmdb_ci_endpoint_jms_flow", "JMS Flow", "JMS Flow Endpoint", "JMS Flow Endpoints");
renameTable("cmdb_ci_endpoint_http", "HTTP(S)", "HTTP(S) Endpoint", "HTTP(S) Endpoints");
renameTable("cmdb_ci_endpoint_dliver_cnrl", "Citrix Delivery Controller", "Citrix Delivery Controller Endpoint", "Citrix Delivery Controller Endpoints");
renameTable("cmdb_ci_endpoint_sap_db", "SAP HANA DB EP", "SAP HANA DB Endpoint", "SAP HANA DB Endpoints");
renameTable("cmdb_ci_endpoint_exchange", "Exchange 2013", "Exchange 2013 Endpoint", "Exchange 2013 Endpoints");


gs.log("Done changing labels for CMDB tables");


function renameTable(tableName, previousLabel, targetLabel, plural){
	//Rename Sys Db Object
	gs.log("About to change label of " + tableName + " from " + previousLabel + " to " + targetLabel);
	var dbObj = new GlideRecord("sys_db_object");
	dbObj.addQuery("name",tableName);
	dbObj.query();
	if(dbObj.next()){
		var currentLabel = dbObj.getValue("label");
		if (currentLabel != previousLabel) {
			gs.log("No need to change label: current label=" + currentLabel +", expected=" + previousLabel);
			return;
		}
		dbObj.setValue("label",targetLabel);
		dbObj.update();
		gs.log("Changed label of " + tableName + " to " + targetLabel);
	} else {
		gs.log("Table " + tableName + " not found in sys_db_object");
	}
	
	// Modify plural in sys_documentation table
	var docObj = new GlideRecord("sys_documentation");
	docObj.addQuery("name",tableName);
	docObj.addNullQuery("element");
	docObj.query();
	if(docObj.next()){
		var currentPlural = docObj.getValue("plural");
		if (currentPlural != plural) {
			gs.log("Changing plural to " + plural);
			docObj.setValue("plural", plural);
			docObj.update();
		}
	} else {
		gs.log("Table " + tableName + " not found in sys_documentation");
	}
	
	gs.log("Done changing label of " + tableName);
}

function changeHint(tableName, previousHint, targetHint){
	// Modifying hint in sys_documentation table
	gs.log("Changing hint of " + tableName + " from " + previousHint + " to " + targetHint);
	var docObj = new GlideRecord("sys_documentation");
	docObj.addQuery("name",tableName);
	docObj.addNullQuery("element");
	docObj.query();
	if(docObj.next()){
		var currentHint = docObj.getValue("hint");
		if (currentHint != previousHint) {
			gs.log("No need to change hint: current=" + currentHint + ", expected=" + previousHint);
			return;
		}
		
		gs.log("Changing hint to " + targetHint);
		docObj.setValue("hint", targetHint);
		docObj.update();
	}
	
	gs.log("Done changing hint of " + tableName);
}
