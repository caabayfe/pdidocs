(function process(g_request, g_response, g_processor) {

    var glideDigest = new GlideDigest();
    function getEncodedFileName(inputFileName){
        return  glideDigest.getMD5Base64(inputFileName);
    }

    var downloadDBFiles = g_request.getParameter("ni.oracledb");
    var downloadMWFiles = g_request.getParameter("ni.oraclemw");
    var encodedFileNamesMap = {};
    var filesProcessedMap = {};


    //if checkbox is selected, we get 'false' as the value otherwise null value

    var globalAttachmentSysID = '';
    var allZipSysId = [];
    var allAttachmentsSysId = [];
    var csvAttachmentsSysId = [];


    //------------ ORCL_V$SESSION.csv START-------------
    function oracleVSession() {
        var tableName = 'cmcb_ci_orcl_vsession';

        var gr = new GlideRecord(tableName);

        var columnNames = ['SADDR', 'SID', 'PADDR', 'USER#', 'USERNAME', 'COMMAND', 'STATUS', 'SERVER', 'SCHEMANAME', 'OSUSER', 'PROCESS', 'MACHINE', 'TERMINAL', 'PROGRAM', 'TYPE', 'LAST_CALL_ET', 'LOGON_TIME', 'MACHINE_ID', 'DB_NAME', 'TIMESTAMP'];
        var rows = [columnNames.join(',')];
        var columns = [getsaddr, getsid, getpaddr, getuser, getusername, getcommand, getstatus, getserver, getschemaname, getosuser, getprocess, getmachine, getterminal, getprogram, gettype, getlast_call_et, getlogon_time, getmachine_id, getdb_name, gettimestamp];


        gr.query();

        while (gr.next()) {

            row = [];

            columns.forEach(function(column) {
                var value = "";
                value = column(gr);
                value = value.trim();

                if (value.indexOf(',') && value.indexOf(',') != -1)
                    row.push(value.replaceAll(',', '%2C'));
                else
                    row.push(value);
            });

            rows.push(row.join(','));
        }
        var filename = 'ORCL_V$SESSION.csv';

        var sysId = deleteAttachmentsIfExistsAddNewAttachment(filename,tableName, gr, rows,false,false);

        updateAttachmentsSysId(filename, sysId);

    }

    //------------  END----------------

    //------------ ORCL_DBA_USERS.csv START-------------
    function oracleDBAUsers() {
        var tableName = 'cmdb_ci_orcl_dba_users';

        gr = new GlideRecord(tableName);

        var columnNames = [];

        var rows = [];

        var columns = [];

        columnNames = ['USERNAME', 'USER_ID', 'DEFAULT_TABLESPACE', 'TEMPORARY_TABLESPACE', 'CREATED', 'PROFILE', 'EXPIRY_DATE', 'ACCOUNT_STATUS', 'COMMON', 'LAST_LOGIN', 'MACHINE_ID', 'DB_NAME', 'TIMESTAMP'];

        rows = [columnNames.join(',')];

        columns = [getusername, getuser_id, getdefault_tablespace, gettemporary_tablespace, getcreated, getprofile, getexpiry_date, getaccount_status, getcommon, getlast_login, getmachine_id, getdb_name, gettimestamp];

        gr.query();

        while (gr.next()) {

            row = [];

            columns.forEach(function(column) {
                var value = "";
                value = column(gr);
                value = value.trim();


                if (value.indexOf(',') && value.indexOf(',') != -1)
                    row.push(value.replaceAll(',', '%2C'));
                else
                    row.push(value);
            });

            rows.push(row.join(','));
        }

        filename = 'ORCL_DBA_USERS.csv';

        var sysId = deleteAttachmentsIfExistsAddNewAttachment(filename,tableName, gr, rows,false,false);
        updateAttachmentsSysId(filename, sysId);

    }
    //------------  END----------------

    //------------ ORCL_DETAIL.csv START-------------
    function oracleDetail() {
        var tableName = 'cmdb_ci_ora_lms_detail';

        gr = new GlideRecord(tableName);

        columnNames = [];

        rows = [];

        columns = [];

        columnNames = ['RL_SCRIPT_VERSION', 'TIMESTAMP', 'MACHINE_ID', 'VMACHINE_ID', 'BANNER', 'DB_NAME', 'USER_COUNT', 'SERVER_MANUFACTURER', 'SERVER_MODEL', 'OPERATING_SYSTEM', 'SOCKETS_POPULATED_PHYS', 'TOTAL_PHYSICAL_CORES', 'PROCESSOR_IDENTIFIER', 'PROCESSOR_SPEED', 'TOTAL_LOGICAL_CORES', 'PARTITIONING_METHOD', 'DB_ROLE', 'INSTALL_DATE'];

        rows = [columnNames.join(',')];

        columns = [getrl_script_version, gettimestamp, getmachine_id, getvmachine_id, getbanner, getdb_name, getuser_count, getserver_manufacturer, getserver_model, getoperating_system, getsockets_populated_phys, gettotal_physical_cores, getprocessor_identifier, getprocessor_speed, gettotal_logical_cores, getpartitioning_method, getdb_role, getinstall_date];

        gr.query();

        while (gr.next()) {

            row = [];

            columns.forEach(function(column) {
                var value = "";
                value = column(gr);
                value = value.trim();


                if (value.indexOf(',') && value.indexOf(',') != -1)
                    row.push(value.replaceAll(',', '%2C'));
                else
                    row.push(value);
            });

            rows.push(row.join(','));
        }

        filename = 'ORCL_DETAIL.csv';

        var sysId = deleteAttachmentsIfExistsAddNewAttachment(filename,tableName, gr, rows,false,false);
        updateAttachmentsSysId(filename, sysId);
    }

    //------------  END----------------

    //------------ ORCL_V$LICENSE.csv START-------------
    function oracleVLicense() {
        var tableName = 'cmdb_ci_orcl_vlicense';

        gr = new GlideRecord(tableName);

        columnNames = [];

        rows = [];

        columns = [];

        columnNames = ['SESSIONS_MAX', 'SESSIONS_WARNING', 'SESSIONS_CURRENT', 'SESSIONS_HIGHWATER', 'CPU_COUNT_CURRENT', 'CPU_COUNT_HIGHWATER', 'USERS_MAX', 'MACHINE_ID', 'DB_NAME', 'TIMESTAMP'];

        rows = [columnNames.join(',')];

        columns = [getsessions_max, getsessions_warning, getsessions_current, getsessions_highwater, getcpu_count_current, getcpu_count_highwater, getusers_max, getmachine_id, getdb_name, gettimestamp];

        gr.query();

        while (gr.next()) {

            row = [];

            columns.forEach(function(column) {
                var value = "";
                value = column(gr);
                value = value.trim();


                if (value.indexOf(',') && value.indexOf(',') != -1)
                    row.push(value.replaceAll(',', '%2C'));
                else
                    row.push(value);
            });

            rows.push(row.join(','));
        }

        filename = 'ORCL_V$LICENSE.csv';

        var sysId = deleteAttachmentsIfExistsAddNewAttachment(filename,tableName, gr, rows,false,false);
        updateAttachmentsSysId(filename, sysId);
    }
    //------------  END----------------

    //------------ ORCL_OVERVIEW.csv START-------------
    function oracleOverview() {
        var tableName = 'cmdb_ci_ora_lms_overview';

        gr = new GlideRecord(tableName);

        columnNames = [];

        rows = [];

        columns = [];

        columnNames = ['HOST_NAME', 'GROUP', 'AGGREGATION_LEVEL', 'ORACLE_CSI', 'ORACLE_PRODUCT_CATEGORY', 'PHYSICAL_MACH_ID', 'VISTUAL_MACH_ID', 'DATABASE_EDITION', 'LICENSE_METRIC', 'DATABASE_NAME', 'PDB_NAME', 'VERSION', 'OPTIONS_INSTALLED', 'OPTIONS_IN_USE', 'PACKS_GRANTED', 'PACKS_AGREED', 'APPLICATION', 'ENVIRONMENT_USAGE', 'USER_COUNT_DBA_USERS', 'USER_COUNT_APPLICATION', 'SERVER_MANUFACTURER', 'SERVER_MODEL', 'OPERATING_SYSTEM', 'SOCKETS_POPULATED_PHYSICAL', 'TOTAL_PHYSICAL_CORES', 'PROCESSOR_IDENTIFIER', 'PROCESSOR_SPEED', 'SOCKET_CAPACITY_PHYSICAL', 'TOTAL_LOGICAL_CORES', 'PARTITIONING_METHOD', 'PRIMARY_DATABASE', 'SESSIONS', 'INSTANCE_SESSIONS_HIGHWATER', 'INSTALL_DATE', 'MEASUREMENT_COMMENT', 'TIMESTAMP'];

        rows = [columnNames.join(',')];

        columns = [gethost_name, getgroup, getaggregation_level, getoracle_csi, getoracle_product_category, getphysical_mach_id, getvistual_mach_id, getdatabase_edition, getlicense_metric, getdatabase_name, getpdb_name, getversion, getoptions_installed, getoptions_in_use, getpacks_granted, getpacks_agreed, getapplication, getenvironment_usage, getuser_count_dba_users, getuser_count_application, getserver_manufacturer, getserver_model, getoperating_system, getsockets_populated_physical, gettotal_physical_cores, getprocessor_identifier, getprocessor_speed, getsocket_capacity_physical, gettotal_logical_cores, getpartitioning_method, getprimary_database, getsessions, getinstance_sessions_highwater, getinstall_date, getmeasurement_comment, gettimestamp];

        gr.query();

        while (gr.next()) {

            row = [];

            columns.forEach(function(column) {
                var value = "";
                value = column(gr);
                value = value.trim();


                if (value.indexOf(',') && value.indexOf(',') != -1)
                    row.push(value.replaceAll(',', '%2C'));
                else
                    row.push(value);
            });

            rows.push(row.join(','));
        }

        filename = 'ORCL_OVERVIEW.csv';

        var sysId = deleteAttachmentsIfExistsAddNewAttachment(filename,tableName, gr, rows,false,false);
        updateAttachmentsSysId(filename, sysId);
    }


    //------------  END----------------

    //------------ ORCL_OPTIONS.csv START-------------
    function oracleOptions() {
        var tableName = 'cmdb_ci_orcl_options';

        gr = new GlideRecord(tableName);

        columnNames = [];

        rows = [];

        columns = [];

        columnNames = ['MACHINE_ID', 'DB_NAME', 'TIMESTAMP', 'HOST_NAME', 'INSTANCE_NAME', 'OPTION_NAME', 'OPTION_QUERY', 'SQL_ERR_CODE', 'SQL_ERR_MESSAGE', 'COL010', 'COL020', 'COL030', 'COL040', 'COL050', 'COL060', 'COL070', 'COL080', 'COL090', 'COL100', 'COL110', 'COL120', 'COL130', 'COL140', 'COL150', 'COL160', 'COL170', 'COL180'];

        rows = [columnNames.join(',')];

        columns = [getmachine_id, getdb_name, gettimestamp, gethost_name, getinstance_name, getoption_name, getoption_query, getsql_err_code, getsql_err_message, getcol010, getcol020, getcol030, getcol040, getcol050, getcol060, getcol070, getcol080, getcol090, getcol100, getcol110, getcol120, getcol130, getcol140, getcol150, getcol160, getcol170, getcol180];

        gr.query();


        while (gr.next()) {

            row = [];

            columns.forEach(function(column) {
                var value = "";
                value = column(gr);
                value = value.trim();

                if (value.indexOf(',') && value.indexOf(',') != -1) {
                    row.push(value.replaceAll(',', '%2C'));
                } else {
                    row.push(value);
                }
            });

            rows.push(row.join(','));
        }

        filename = 'ORCL_OPTIONS.csv';

        var sysId = deleteAttachmentsIfExistsAddNewAttachment(filename,tableName, gr, rows,false,false);
        updateAttachmentsSysId(filename, sysId);
    }


    //------------  END----------------


    //---------------------- HELPER FUNCTIONS START-------------------





    //ORCL_V$SESSION.csv
    function getsaddr(gr) {
        return gr.saddr;
    }

    function getsid(gr) {
        return gr.sid;
    }

    function getpaddr(gr) {
        return gr.paddr;
    }

    function getuser(gr) {
        return gr.user;
    }

    function getusername(gr) {
        return gr.username;
    }

    function getcommand(gr) {
        return gr.command;
    }

    function getstatus(gr) {
        return gr.status;
    }

    function getserver(gr) {
        return gr.server;
    }

    function getschemaname(gr) {
        return gr.schemaname;
    }

    function getosuser(gr) {
        return gr.osuser;
    }

    function getprocess(gr) {
        return gr.process;
    }

    function getmachine(gr) {
        return gr.machine;
    }

    function getterminal(gr) {
        return gr.terminal;
    }

    function getprogram(gr) {
        return gr.program;
    }

    function gettype(gr) {
        return gr.type;
    }

    function getlast_call_et(gr) {
        return gr.last_call_et;
    }

    function getlogon_time(gr) {
        return gr.logon_time;
    }

    function getmachine_id(gr) {
        return gr.machine_id;
    }

    function getdb_name(gr) {
        return gr.db_name;
    }

    function gettimestamp(gr) {
        return gr.timestamp;
    }

    //ORCL_DBA_USERS.csv

    function getuser_id(gr) {
        return gr.user_id;
    }

    function getdefault_tablespace(gr) {
        return gr.default_tablespace;
    }

    function gettemporary_tablespace(gr) {
        return gr.temporary_tablespace;
    }

    function getcreated(gr) {
        return gr.created2;
    }

    function getprofile(gr) {
        return gr.profile;
    }

    function getexpiry_date(gr) {
        return gr.expiry_date;
    }

    function getaccount_status(gr) {
        return gr.account_status;
    }

    function getcommon(gr) {
        return gr.common;
    }

    function getlast_login(gr) {
        return gr.last_login;
    }

    //ORCL_DETAIL.csv
    function getrl_script_version(gr) {
        return gr.rl_script_version;
    }

    function getvmachine_id(gr) {
        return gr.vmachine_id;
    }

    function getbanner(gr) {
        return gr.banner;
    }

    function getuser_count(gr) {
        return gr.user_count;
    }

    function getserver_manufacturer(gr) {
        return gr.server_manufacturer;
    }

    function getserver_model(gr) {
        return gr.server_model;
    }

    function getoperating_system(gr) {
        return gr.operating_system;
    }

    function getsockets_populated_phys(gr) {
        return gr.sockets_populated_phys;
    }

    function gettotal_physical_cores(gr) {
        return gr.total_physical_cores;
    }

    function getprocessor_identifier(gr) {
        return gr.processor_identifier;
    }

    function getprocessor_speed(gr) {
        return gr.processor_speed;
    }

    function gettotal_logical_cores(gr) {
        return gr.total_logical_cores;
    }

    function getpartitioning_method(gr) {
        return gr.partitioning_method;
    }

    function getdb_role(gr) {
        return gr.db_role;
    }

    function getinstall_date(gr) {
        return gr.install_date2;
    }

    // ORCL_V$LICENSE.csv
    function getsessions_max(gr) {
        return gr.sessions_max;
    }

    function getsessions_warning(gr) {
        return gr.sessions_warning;
    }

    function getsessions_current(gr) {
        return gr.sessions_current;
    }

    function getsessions_highwater(gr) {
        return gr.sessions_highwater;
    }

    function getcpu_count_current(gr) {
        return gr.cpu_count_current;
    }

    function getcpu_count_highwater(gr) {
        return gr.cpu_count_highwater;
    }

    function getusers_max(gr) {
        return gr.user_max;
    }

    //ORCL_OVERVIEW.csv
    function gethost_name(gr) {
        return gr.host_name;
    }

    function getgroup(gr) {
        return gr.group;
    }

    function getaggregation_level(gr) {
        return gr.aggregation_level;
    }

    function getoracle_csi(gr) {
        return gr.oracle_csi;
    }

    function getoracle_product_category(gr) {
        return gr.oracle_product_category;
    }

    function getphysical_mach_id(gr) {
        return gr.physical_mach_id;
    }

    function getvistual_mach_id(gr) {
        return gr.virtual_mach_id;
    }

    function getdatabase_edition(gr) {
        return gr.database_edition;
    }

    function getlicense_metric(gr) {
        return gr.license_metric;
    }

    function getdatabase_name(gr) {
        return gr.database_name;
    }

    function getpdb_name(gr) {
        return gr.pdb_name;
    }

    function getversion(gr) {
        return gr.version;
    }

    function getoptions_installed(gr) {
        return gr.options_installed;
    }

    function getoptions_in_use(gr) {
        return gr.options_in_use;
    }

    function getpacks_granted(gr) {
        return gr.packs_granted;
    }

    function getpacks_agreed(gr) {
        return gr.packs_agreed;
    }

    function getapplication(gr) {
        return gr.application;
    }

    function getenvironment_usage(gr) {
        return gr.environment_usage;
    }

    function getuser_count_dba_users(gr) {
        return gr.user_count_dba_users;
    }

    function getuser_count_application(gr) {
        return gr.user_count_application;
    }

    function getsockets_populated_physical(gr) {
        return gr.sockets_populated_physical;
    }

    function getsocket_capacity_physical(gr) {
        return gr.socket_capacity_physical;
    }

    function getprimary_database(gr) {
        return gr.primary_database;
    }

    function getsessions(gr) {
        return gr.sessions;
    }

    function getinstance_sessions_highwater(gr) {
        return gr.instance_sessions_highwater;
    }

    function getmeasurement_comment(gr) {
        return gr.measurement_comment;
    }

    //ORCL_OPTIONS.csv #
    function getinstance_name(gr) {
        return gr.instance_name;
    }

    function getoption_name(gr) {
        return gr.option_name;
    }

    function getoption_query(gr) {
        return gr.option_query;
    }

    function getsql_err_code(gr) {
        return gr.sql_err_code;
    }

    function getsql_err_message(gr) {
        return gr.sql_err_message;
    }

    function getcol010(gr) {
        return gr.col010;
    }

    function getcol020(gr) {
        return gr.col020;
    }

    function getcol030(gr) {
        return gr.col030;
    }

    function getcol040(gr) {
        return gr.col040;
    }

    function getcol050(gr) {
        return gr.col050;
    }

    function getcol060(gr) {
        return gr.col060;
    }

    function getcol070(gr) {
        return gr.col070;
    }

    function getcol080(gr) {
        return gr.col080;
    }

    function getcol090(gr) {
        return gr.col090;
    }

    function getcol100(gr) {
        return gr.col100;
    }

    function getcol110(gr) {
        return gr.col110;
    }

    function getcol120(gr) {
        return gr.col120;
    }

    function getcol130(gr) {
        return gr.col130;
    }

    function getcol140(gr) {
        return gr.col140;
    }

    function getcol150(gr) {
        return gr.col150;
    }

    function getcol160(gr) {
        return gr.col160;
    }

    function getcol170(gr) {
        return gr.col170;
    }

    function getcol180(gr) {
        return gr.col180;
    }


    function deleteAttachmentsIfExistsAddNewAttachment(fileName, tableName, gr, rows, isFileZip, doEncoding) {

        var derivedFileName = fileName;

        if(doEncoding){
            derivedFileName = getEncodedFileName(fileName);
        }

        var sysAttachmentGR = new GlideRecord('sys_attachment');
        if(isFileZip){
            sysAttachmentGR.addQuery('file_name', derivedFileName);
            sysAttachmentGR.addQuery('table_name', tableName);
            sysAttachmentGR.addQuery('table_sys_id', gr.sys_id);
        }else{
            sysAttachmentGR.addQuery('file_name', derivedFileName);
            sysAttachmentGR.addQuery('table_name', tableName);
        }
        sysAttachmentGR.query();
        if (sysAttachmentGR.next()) {
            sysAttachmentGR.deleteRecord();
        }

        var fileExt = fileName.split('.').pop();
        var fileType = '';

        if (fileExt.toUpperCase() == 'CSV') {
            fileType = 'application/csv';
            rows = rows.join('\n');
        } else if (fileExt.toUpperCase() == 'TXT') {
            fileType = 'application/txt';
        } else if (fileExt.toUpperCase() == 'XML') {
            fileType = 'application/xml';
        } else if (fileExt.toUpperCase() == 'ZIP') {
            fileType = 'application/zip';
        }

        var sa = new GlideSysAttachment();
        var sysId = sa.write(gr, derivedFileName, fileType, rows);

        encodedFileNamesMap[derivedFileName] = fileName;
        return sysId;

    }

    function addBytesToZip(out, file, stream) {
        // Add ZIP entry to output stream.
        out.putNextEntry(new Packages.java.util.zip.ZipEntry(file));
        out.write(stream, 0, stream.length);
        out.closeEntry();
    }

    function updateAttachmentsSysId(fileName, sysId) {

        if (fileName.includes('.zip') || fileName.includes('.tar.bz')) {
            allZipSysId.push(sysId);
        } else if (fileName.includes('.csv')) {
            csvAttachmentsSysId.push(sysId);
        } else {
            allAttachmentsSysId.push(sysId);
        }
    }

    function createZipOfAttachments(zipName, gr, emptyOpmnOutputFile) {

        var derivedFileName = '';

        if (gr.hasNext()) {

            var bos = new Packages.java.io.ByteArrayOutputStream();
            var out = new Packages.java.util.zip.ZipOutputStream(bos);
            try{
                while (gr.next()) {
                    derivedFileName = encodedFileNamesMap[gr.getValue('file_name')];
                    if (gs.nil(derivedFileName)){
                        derivedFileName = gr.getValue('file_name');
                    }
                    if (derivedFileName.includes('.zip') || derivedFileName.includes('.bz')) {
                        continue;
                    }
                    sa = new GlideSysAttachment();
                    var gsa = GlideSysAttachmentInputStream(gr.sys_id.toString());
                    var baos = new Packages.java.io.ByteArrayOutputStream();
                    gsa.writeTo(baos);
                    baos.close();
                    var binData = baos.toByteArray();
                    var file = derivedFileName;
                    addBytesToZip(out, file, binData);
                }


                if(!gs.nil(emptyOpmnOutputFile)) {
                    addBytesToZip(out, emptyOpmnOutputFile, []);
                }
                out.close();

            }catch(ex){
                var message = ex.message;
                gs.error("Unable to attach the files: " + message);
            }finally{
                if (out != null){
                        try{
                            out.close();
                        }
                        catch (ex){
                            message = ex.message;
                            gs.error("Unable to attach the files: " + message);
                        }
                }
            }
            var tcGr = new GlideRecord('cmdb_ci_config_file_tracked');
            tcGr.get(globalAttachmentSysID);

            var attachmentsSysId = deleteAttachmentsIfExistsAddNewAttachment(zipName, tcGr.getTableName(), tcGr, bos.toByteArray(),true, true);
            return attachmentsSysId;
        }

    }

    function queryBuilder(queryArray) {
        var i = 0;
        var queryStatement = 'sys_id=';
        while (i < queryArray.length - 1) {
            queryStatement += queryArray[i];
            queryStatement += '^ORsys_id=';
            i++;
        }
        queryStatement += queryArray[i];
        return queryStatement;
    }

    function deleteAllAttachments(sysIdToDelete) {
        if (sysIdToDelete.length >= 1) {
            var sysGlideRecord = new GlideRecord('sys_attachment');
            sysGlideRecord.addQuery('sys_id', 'IN', sysIdToDelete);
            sysGlideRecord.query();
            sysGlideRecord.deleteMultiple();
        }
    }

    function addFileAsAttachments(glideRecord, ipProperty, portProperty, usernameProperty, zipName, extension) {
        
        var emptyOpmnOutputFileName = '';
        var deriveEmptyOutputFileName = true;

        while (glideRecord.next()) {
            if (glideRecord.content.toString() == null) {
                continue;
            }

            if(deriveEmptyOutputFileName) {
                deriveEmptyOutputFileName = false;
                emptyOpmnOutputFileName = '/' + zipName + '/FMW/' + glideRecord.host.name.toString() + '-opmn_output.txt';
            }

            var updatedFileName = '/' + zipName + '/FMW' + glideRecord.name;
            var txtFileName = glideRecord.name.split('/').pop();
            if (glideRecord.name.includes('CTlogfiles.txt') || (txtFileName.startsWith('Collection-') && txtFileName.endsWith('.txt'))) {
                updatedFileName = '/' + zipName + '/logs/' + txtFileName;
            }
	    txtFileName = txtFileName.toLowerCase();

            if (glideRecord.name.includes('-info.txt') || glideRecord.name.includes('-glas_cpuq.txt') || glideRecord.name.includes('-opmn_output.txt')) {
                if (glideRecord.getValue('host') != glideRecord.getValue('related_ci')) {
                    continue;
                }
                if (txtFileName.includes('glas_cpuq.txt')) {
                    updatedFileName = '/' + zipName + '/CPUQ/' + txtFileName;
                } else if (txtFileName.includes('-opmn_output.txt')) {
                    updatedFileName = '/' + zipName + '/FMW/' + txtFileName;
                    emptyOpmnOutputFileName = ''; //actual file found hence nullyfing it
                } else {
                    updatedFileName = '/' + zipName + '/logs/' + txtFileName;
                }
            }
            
            if(filesProcessedMap[updatedFileName] == true){
                continue;
            }
            
            filesProcessedMap[updatedFileName] = true;
            var parserObj = new sn_itom_oracleglas.OracleMiddlewareParserBuilder();
            var fileContent = parserObj.identifyParser(glideRecord.name, glideRecord.content, ipProperty, portProperty, usernameProperty);
            var attachmentsSysId = deleteAttachmentsIfExistsAddNewAttachment(updatedFileName, 'cmdb_ci_config_file_tracked', glideRecord, fileContent,false,true);
            updateAttachmentsSysId(updatedFileName, attachmentsSysId);

            if (globalAttachmentSysID == '') {
                globalAttachmentSysID = glideRecord.sys_id;
            }
        }
        

        var attachedAttachments = queryBuilder(allAttachmentsSysId);

        var saGr = new GlideRecord('sys_attachment');
        saGr.addQuery(attachedAttachments);
        saGr.query();

        var zipSysID = createZipOfAttachments(zipName + extension, saGr,emptyOpmnOutputFileName); //Creating zip per host passing glideRecord object and zipName

        updateAttachmentsSysId(zipName + extension, zipSysID);
        deleteAllAttachments(allAttachmentsSysId);
        allAttachmentsSysId = [];

    }


    //---------------------- HELPER FUNCTIONS END-------------------
    //---------------------- COMBINE ALL CSV TO ONE ZIP START-------------------

    function attachMWFiles() {

        var ipProperty = gs.getProperty('sn_itom_oracleglas.isMaskingIp');
        var usernameProperty = gs.getProperty('sn_itom_oracleglas.isMaskingUserName');
        var portProperty = gs.getProperty('sn_itom_oracleglas.isMaskingPort');

        var tcGr = new GlideAggregate('cmdb_ci_config_file_tracked');
        tcGr.addQuery('related_ci.sys_class_name', 'cmdb_ci_app_server_weblogic')
            .addOrCondition('related_ci.sys_class_name', 'cmdb_ci_appl_tuxedo');
        tcGr.groupBy('host');
        tcGr.query();

        while (tcGr.next()) {

            var glideRecord = new GlideRecord('cmdb_ci_config_file_tracked');
            glideRecord.addQuery('host', tcGr.getValue('host'));
            glideRecord.addQuery('related_ci.sys_class_name', 'cmdb_ci_app_server_weblogic')
                .addOrCondition('related_ci.sys_class_name', 'cmdb_ci_appl_tuxedo')
                .addOrCondition('name', 'ENDSWITH', 'glas_cpuq.txt')
                .addOrCondition('name', 'ENDSWITH', '-info.txt')
                .addOrCondition('name', 'ENDSWITH', '-opmn_output.txt');
            glideRecord.orderByDesc('sys_updated_on');
            glideRecord.query();

            var zipName = 'Collection-' + tcGr.host.name + '_all';
            var extension = '';

            if (tcGr.host.sys_class_name.includes('linux')) {
                extension = '.tar.bz';
            } else {
                extension = '.zip';
            }

            addFileAsAttachments(glideRecord, ipProperty, portProperty, usernameProperty, zipName, extension); //Adding files as an attachment by glideRecord object 

        }
    }

    //-------------------------Building Query Start-------------------------------------------------------------
    function main() {

        var csvQuery = 'file_nameINORCL_V$SESSION.csv,ORCL_DBA_USERS.csv,ORCL_DETAIL.csv,ORCL_V$LICENSE.csv,ORCL_OPTIONS.csv';

        var finalQuery = "file_name=ORCL_OVERVIEW.csv^OR";
        
            //if checkbox is selected, we get 'false' as the value otherwise null value
        
        if ((downloadDBFiles == "false" && downloadMWFiles == null) || (downloadDBFiles == null && downloadMWFiles == null)) {
            oracleVSession();
            oracleDBAUsers();
            oracleDetail();
            oracleVLicense();
            oracleOverview();
            oracleOptions();
            finalQuery += csvQuery;
        } else if (downloadMWFiles == "false" && downloadDBFiles == null) {
            oracleOverview();
            attachMWFiles();
            finalQuery += queryBuilder(allZipSysId);
        } else if (downloadMWFiles == "false" && downloadDBFiles == "false") {
            oracleVSession();
            oracleDBAUsers();
            oracleDetail();
            oracleVLicense();
            oracleOverview();
            oracleOptions();
            attachMWFiles();
            finalQuery += csvQuery + "^OR" + queryBuilder(allZipSysId);
        }
        //-------------------------Building Query End-------------------------------------------------------------


        //--------------disable the following system property--------------"glide.security.file.mime_type.validation"---
        var externalZipName = 'Oracle GLAS Report.zip';

        var saGr = new GlideRecord('sys_attachment');
        saGr.addQuery(finalQuery);
        saGr.query();

        
            if (saGr.hasNext()) {
                g_response.setHeader('Pragma', 'public');
                g_response.addHeader('Cache-Control', 'max-age=0');
                g_response.setContentType('application/octet-stream');
                g_response.addHeader('Content-Disposition', 'attachment;filename=' + externalZipName);

                try{
                    var out = new Packages.java.util.zip.ZipOutputStream(g_response.getOutputStream());

                    while (saGr.next()) {
                        sa = new GlideSysAttachment();
                       var gsa = GlideSysAttachmentInputStream(saGr.sys_id.toString());
                       var baos = new Packages.java.io.ByteArrayOutputStream();
                       gsa.writeTo(baos);
                       baos.close();
                       var binData = baos.toByteArray();
                        var file = encodedFileNamesMap[saGr.getValue('file_name')] ;
                        if(gs.nil(file)){
                            file = saGr.getValue('file_name');
                        }
                        addBytesToZip(out, file, binData);
                    }

                    //Complete the ZIP file
                    out.close();
                }catch(ex) {
                    var message = ex.message;
                    gs.error("Unable to attach the files: " + message);
                }finally{
                    if (out != null){
                        try{
                            out.close();
                        }
                        catch (ex){
                            message = ex.message;
                            gs.error("Unable to attach the files: " + message);
                        }
                    }
                }
            }   
        
        
        deleteAllAttachments(allZipSysId);
        allZipSysId = [];

        deleteAllAttachments(csvAttachmentsSysId);
        csvAttachmentsSysId = [];
        
        }

    main();

    //---------------------- COMBILE ALL CSV TO ZIP END-------------------


})(g_request, g_response, g_processor);
