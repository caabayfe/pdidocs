var DiscoveryFunctions = Class.create();

(function() {

    var NO_VALUE = '<SNOW_NO_VALUE_SNOW>';
    var CACHE_NAME = 'discovery_table_cache';
    var MAX_TABLE_SIZE_TO_CACHE = 300;
    var TOO_MANY_RECORDS = 'Error: too many records to cache.';
    var CANNOT_CACHE = 'Error: cannot cache this table';

    DiscoveryFunctions.prototype = {
        initialize: function() {},

        getDiscoverySource: function() {
            var gr = new GlideRecord("sys_properties");
            if (gr.get("name", "glide.discovery.source_name"))
                return gr.getValue('value');
            return "";
        },

        getScheduleRecord: function() {
            var statusGR = this.getStatusRecord();
            if (!statusGR)
                return;

            var gr = new GlideRecord('discovery_schedule');
            if (statusGR.dscheduler)
                gr.get('sys_id', statusGR.dscheduler);
            return gr;
        },

        getStatusRecord: function() {
            var statusSysId = g_probe.getCorrelator();
            if (gs.nil(statusSysId)) {
                if (typeof agent_correlator != 'string' && agent_correlator)
                    statusSysId = agent_correlator;
                else if (current) {
                    if (current.agent_correlator)
                        statusSysId = current.agent_correlator;
                    else if (current.getTableName() == "discovery_status")
                        return current;
                }
            }

            if (!statusSysId)
                return null;

            var gr = new GlideRecord('discovery_status');
            if (statusSysId)
                gr.get('sys_id', statusSysId);
            return gr;
        },

        getDiscoveryType: function(statusID) {
            var statusGR = new GlideRecord('discovery_status');
            statusGR.get(statusID);
            var schedGR = new GlideRecord('discovery_schedule');
            schedGR.get(statusGR.dscheduler);
            return schedGR.discover;
        },

        getService: function(port) {
            var gr = new GlideRecord("cmdb_ip_service");
            if (!gr.get("port", port)) {
                gr.initialize();
                gr.setValue("port", port);
                gr.setValue("name", "unknown - port(" + port + ")");
                gr.insert();
            }

            return gr;
        },

        isInRange: function(ip) {
            var gr = this.getStatusRecord();
            if (gr != null) {
                var hostList = gr.scratchpad.host_list;

                if (hostList) {
                    var hosts = StringUtil.split(hostList, ",");
                    if (hosts.contains(ip))
                        return true;
                }

                return SncDiscoveryRangesDB.inRanges(ip, gr.dscheduler);
            }

            return false;
        },

        getXMLMemoryTable: function(tableName, doc, path) {
            var result = null;
            try {
                result = GlidesoftXMLMemoryTable.getFromDocAndXPath(tableName, doc, path);
            } catch (iae) {
                // do nothing; we'll return a null...
            }
            return result;
        },

        getFieldsThatChanged: function(gr) {
            var changes = [];

            if (gr == null || !gr.isValid())
                return changes;

            var gru = GlideScriptRecordUtil.get(gr);
            var ignoreables = new Packages.java.util.ArrayList();
            ignoreables.add("last_discovered");

            var whatChanged = gru.getChangedFields(ignoreables);
            for (var i = 0; i < whatChanged.size(); i++) {
                var f = whatChanged.get(i);
                changes.push(f);
            }

            return changes;
        },

        updatedHistory: function(gr, sensor, eccID) {
            var fieldsChanged = this.getFieldsThatChanged(gr);
            if (fieldsChanged.length > 0)
                g_device.log("Updated device fields " + fieldsChanged.join(", "), sensor, eccID);
        },

        /*
         *  Return the sys_id of the relationship created. Otherwise return null or undefined.
         */
        createRelationshipFromSysIds: function(parentId, childId, pDescription, cDescription) {
            if (JSUtil.nil(parentId) || JSUtil.nil(childId))
                return;
            if (!this.validCISysId(parentId) || !this.validCISysId(childId)) {
                return;
            }

            if (!cDescription && pDescription.indexOf("::") > -1) {
                var parts = pDescription.split("::");
                pDescription = parts[0];
                cDescription = parts[1];
            }

            var ECMDBUtil = SncECMDBUtil;
            return ECMDBUtil.createCIRelationship('cmdb_rel_ci', parentId, childId, pDescription, cDescription);
        },

        // Validate sysid
        validCISysId: function(sysID) {
            // Case 1: Check for null sys id
            if (gs.nil(sysID)) {
                gs.log('Invalid Rel CI Record :: Null SysID');
                return false;
            }

            //extracting only alphanumeric and comparing 32 chars
            if (sysID.match(/[0-9a-f]{32}/) == sysID) {
                return true;
            } else {
                // Case 3:SysID is not null
                // but it is not a valid sysID by its strig format [Alphanumeric and exactly 32 chars]
                gs.log('Invalid Rel CI Record :: Invalid SysID(Regex only) :SysID ' + sysID);
                return false;
            }
        },

        //
        // Args:    parent <pDescription> child   /    child <cDescription> parent
        // Example: vmware   Runs on      sanops  /    sanops    Runs       vmware
        // parent, child input can either be GlideRecord or sys_id
        //
        createRelationship: function(parent, child, pDescription, cDescription) {
            if (JSUtil.nil(parent) || JSUtil.nil(child))
                return;

            var parentId = parent;
            var childId = child;

            //If parent or child is a GlideRecord object, we need to extract the sys_id
            if (parent instanceof GlideRecord)
                parentId = parent.sys_id;
            if (child instanceof GlideRecord)
                childId = child.sys_id;

            return this.createRelationshipFromSysIds(parentId, childId, pDescription, cDescription);
        },

        /*
         *  Return the sys_id of the relationship if found or created. Otherwise return null or undefined.
         */
        createRelationshipIfNotExists: function(parent, child, descriptor, ensureUnique) {
            var result = this.relationshipExists(parent, child, descriptor);
            if (JSUtil.notNil(result))
                return result;

            var createdRelationship = this.createRelationship(parent, child, descriptor);

            //checking unique for the newly created relationship
            if (ensureUnique)
                this.deleteRelationshipIfMultipleExists(parent, child, descriptor);

            return createdRelationship;
        },

        /*
         *  Checks to see if a relationship already exists
         */
        relationshipExists: function(parent, child, descriptor) {
            if (JSUtil.nil(parent) || JSUtil.nil(child) || JSUtil.nil(descriptor))
                return;

            var parentId = parent;
            var childId = child;

            //If parent or child is a GlideRecord object, we need to extract the sys_id
            if (parent instanceof GlideRecord)
                parentId = parent.sys_id;
            if (child instanceof GlideRecord)
                childId = child.sys_id;

            var relationType = this.findCIRelationshipType("cmdb_rel_type", descriptor);

            var gr = new GlideRecord("cmdb_rel_ci");
            gr.addQuery("parent", parentId);
            gr.addQuery("child", childId);
            gr.addQuery("type", relationType);
            gr.query();
            if (gr.next())
                return gr;

            return;
        },

        /*
         *  Deleted duplicate relationship from cmdb_rel_ci
         */
        deleteRelationshipIfMultipleExists: function(parent, child, relTypeName) {
            var gr = new GlideRecord('cmdb_rel_ci');
            var relTypeId = this.findCIRelationshipType('cmdb_rel_type', relTypeName);

            gr.addQuery('parent', parent);
            gr.addQuery('child', child);
            gr.addQuery('type', relTypeId);
            gr.orderBy('sys_id');
            gr.query();

            if (gr.getRowCount() > 1) {
                gs.info('Duplicate relationship %% ' + relTypeName + ' exists between the parent  ' + parent + ' and child ' + child);

                // Don't allow exact duplicates.  We'll keep the one with the lowest sys_id
                // to avoid a race condition where two threads insert a record at the same
                // time and both decide to delete it.
                gr.next();

                // Delete duplicate record
                while (gr.next()) {
                    gr.deleteRecord();
                    gs.info('Deleted Duplicate relationship %% ' + relTypeName + ' between the parent  ' + parent + ' and child ' + child);
                }
            }
        },

        /**
         * get a child of this parent of type matched by the descriptor
         *
         * Descriptor is of form <Parent Relationship>::<Child Relationship>
         * so, for example calling this method on a web server with descriptor "RunsOn::Runs"
         * returns the computer it runs on.  Thus, web server is the parent and computer is the child
         */

        getChildCI: function(parent, descriptor) {
            var gr = new GlideRecord("cmdb_rel_ci");
            gr.addQuery("parent", parent.sys_id);
            if (descriptor) {
                var relationType = this.findCIRelationshipType("cmdb_rel_type", descriptor);
                if (relationType)
                    gr.addQuery("type", relationType);
            }
            gr.query();

            if (gr.next()) {
                var cigr = new GlideRecord("cmdb_ci");
                if (gr.child && cigr.get('sys_id', gr.child)) {
                    return cigr;
                }
            }
            return null;
        },

        reclassify: function(gr, newClassName, reason) {
            // we are already that class, just return
            if (gr.sys_class_name == newClassName)
                return gr;

            var rci = SncReclassifyCI.createFromGlideRecord(gr, newClassName);
            rci.setApplyDefaults(false);
            rci.setReason(reason);
            return rci.reclassify();
        },

        deleteCIBySysId: function(sysId, workflow) {
            var gr = new GlideRecord("cmdb_ci");
            if (!sysId || !gr.get('sys_id', sysId))
                return;

            this.deleteCI(gr, workflow);
        },

        deleteCI: function(gr, workflow) {
            var al = [];
            al.push(gr.getValue("sys_id"));

            //Check to see if it matches these two criteria
            if (!(gr.instanceOf("cmdb_ci_computer") || gr.instanceOf("cmdb_ci_appl"))) {
                gr.deleteRecord();
                return;
            }

            if (workflow && workflow != "false") {
                this.deleteCIAndRelationshipsRecursive(al);
                return;
            }

            try {
                var oldWorkflow = session.getWorkflow();
                this.deleteCIAndRelationshipsRecursive(al);
            } finally {
                session.setWorkflow(oldWorkflow);
            }

        },

        /*
         * This is where the heavy lifting of traversing through the relationship tree is done
         * We only traverse through the relatinoships that have RUNS_ON and HOSTED_ON relationships at this point
         *
         * We basically look for all the parent CIs that runs on or is hosted on the child CI(s) and delete them.
         */

        deleteCIAndRelationshipsRecursive: function(appList) {
            if (appList.length == 0)
                return appList;

            var appListNew = [];
            var tempSysId;
            var sysID;
            for (var i = 0; i < appList.length; i++) {
                sysID = appList[i];
                var gr = new GlideRecord("cmdb_rel_ci");
                gr.addQuery("child", sysID);
                var qc = gr.addQuery("type", this.findCIRelationshipType("cmdb_rel_type", "Runs on::Runs"));
                qc.addOrCondition("type", this.findCIRelationshipType("cmdb_rel_type", "Hosted on::Hosts"));
                gr.query();
                while (gr.next()) {
                    tempSysId = gr.getValue("parent");

                    //Check to see if same CI could runs-on or be hosted on same child (maybe possible?)
                    if (!contains(appListNew, tempSysId))
                        appListNew.push(tempSysId);

                    gr.deleteRecord(); //delete the relationship entry
                }

                var cigr = new GlideRecord("cmdb_ci");
                if (sysID && cigr.get('sys_id', sysID))
                    cigr.deleteRecord();
            }

            return this.deleteCIAndRelationshipsRecursive(appListNew);

            function contains(arr, value) {
                for (var i = 0; i < arr.length; i++)
                    if (arr[i] == value)
                        return true;
                return false;
            }

        },

        /**
         * @deprecated Use findCIRelationshipType() instead. This function no longer creates
         * relationship types; it simply delegates to findCIRelationshipType() and throws if not found.
         */
        findOrCreateRelationshipType: function(refTable, descriptor) {
            var result = this.findCIRelationshipType(refTable, descriptor);
            if (JSUtil.notNil(result))
                return result;

            throw new Error('Relationship type not found and will not be created: ' + descriptor);
        },

        findCIRelationshipType: function(refTable, descriptor) {

            // refTable should be an optional parameter (because we always pass the
            // same value).  I can't change the function signature, so this is the
            // only way to make it optional.
            if (!descriptor)
                return this.findCIRelationshipTypeByDesc('cmdb_rel_type', refTable);

            return this.findCIRelationshipTypeByDesc(refTable, descriptor);
        },

        findCIRelationshipTypeByDesc: function(refTable, pDescriptor, cDescriptor) {

            var descriptor = pDescriptor;
            if (cDescriptor)
                descriptor += '::' + cDescriptor;

            return DiscoveryFunctions.getFirstValueFromTable(refTable, descriptor, 'name') || getRelType();

            // Keeping this for backward compatability
            function getRelType() {
                if (pDescriptor && !cDescriptor) {
                    pDescriptor = pDescriptor.split('::');
                    cDescriptor = pDescriptor[1];
                    pDescriptor = pDescriptor[0];
                }
                var gr = new GlideRecord(refTable);
                gr.addQuery('parent_descriptor', pDescriptor);
                gr.addQuery('child_descriptor', cDescriptor);
                gr.query();
                if (gr.next())
                    return '' + gr.getValue('sys_id');
                return '';
            }
        },


        /* Manage the PIDs creation and update */
        insertPIDs: function(pids, app_sys_id, ci_sys_id) {
            if (StringUtil.nil(pids))
                return;

            var pid_array = pids.match(/\d+/g);
            var gr = new GlideRecord("cmdb_pid");
            gr.initialize();
            for (var i = 0; i < pid_array.length; i++) {
                gr.pid = pid_array[i];
                gr.application = app_sys_id;
                gr.cmdb_ci = ci_sys_id;
                gr.insert();
            }
        },

        updatePIDs: function(pids, app_sys_id, ci_sys_id) {
            if (StringUtil.nil(pids))
                return;

            var gr = new GlideRecord("cmdb_pid");
            gr.addQuery("application", app_sys_id);
            gr.query();
            gr.deleteMultiple();

            this.insertPIDs(pids, app_sys_id, ci_sys_id);
        },

        /**********************************************
         * Manage the Windows installed software xml
         *
         * Example payload:
         *   <results probe_time="6313">
         *     <result>
         *       <Registry>
         *         <entry key="HKEY_LOCAL_MACHINE">
         *           <entry key="Software">
         *             <entry key="Microsoft">
         *               <entry key="Windows">
         *                 <entry key="Name">
         *                   <value>Just a name</value>
         *                 </entry>
         *               </entry>
         *             </entry>
         *           </entry>
         *         </entry>
         *       </Registry>
         *     </entry>
         *   </results>
         *
         *   // To find the value of the key called "name", here's how these methods can be used.
         *   // registry is a variable representing the payload
         *   var node = findRegistryNode(registry, "HKEY_LOCAL_MACHINE.Software.Microsoft");
         *   var name = findNodeValueWithAttribute(node, "Name");
         *********************************************/
        findRegistryNode: function(currNode, regName) {
            var node = currNode;
            var names = regName.split(".");

            for (var i = 0; i < names.length; i++) {
                node = this.findNodeWithAttribute(node, names[i]);
                if (!node)
                    return null;
            }

            return node;
        },

        findNodeWithAttribute: function(currNode, attrName) {
            if (JSUtil.nil(currNode))
                return "";

            var nodeArray = g_array_util.ensureArray(currNode.entry);
            for (var i = 0; i < nodeArray.length; i++)
                if (nodeArray[i]['@key'] == attrName)
                    return nodeArray[i];

            return null;
        },

        findNodeValueWithAttribute: function(currNode, attrName) {
            if (JSUtil.nil(currNode))
                return "";

            var nodeArray = g_array_util.ensureArray(currNode.entry);
            for (var i = 0; i < nodeArray.length; i++)
                if (nodeArray[i]['@key'] == attrName)
                    return nodeArray[i].value;

            return "";
        },

        type: "DiscoveryFunctions"
    };

    // This method converts a glide record into an Object
    // use skipAttribute to skip any table attribute you do not want in the object.
    // All return values are returned as string
    DiscoveryFunctions.glideRecordToObject = function(gr, skipAttribute) {
        skipAttribute = skipAttribute || {};
        var obj = {};

        for (var grField in gr) {
            if (skipAttribute[grField])
                continue;

            obj[grField] = gr.getValue(grField);;
        }

        return obj;
    };

    DiscoveryFunctions.flushTableCache = function(tableName, cacheKeyColumn, encodedQuery) {
            var cacheKeyForTable = undefined;
            if (tableName && cacheKeyColumn)
                cacheKeyForTable = DiscoveryFunctions.getCacheKeyForTable(tableName, cacheKeyColumn, encodedQuery);
            sn_scoped_cache.ScopedCacheManager.flushScopedCache(CACHE_NAME, cacheKeyForTable);
        },

        /*
            This method returns the cache as an Object, if cache does not exist it creates it.
            @param: tableName: the cached table to get
            @param: cacheKeyColumn: the name of the column of the cached key for the table
            @param: cacheValueColumn: the name of the column of the cached value for the table
            @param: encodedQuery: an encoded query in case we don't need the enitre table
            @return the cached object as an Object (see cacheTable() returned type) or an object indicating that there was not cached value.
        */
        DiscoveryFunctions.getCacheObjectForTable = function(tableName, cacheKeyColumn, encodedQuery) {
            if (!tableName)
                return undefined;
            // assume sys id
            if (!cacheKeyColumn)
                cacheKeyColumn = 'sys_id';

            var cacheKeyForTable = DiscoveryFunctions.getCacheKeyForTable(tableName, cacheKeyColumn, encodedQuery);
            var cacheStr = sn_scoped_cache.ScopedCacheManager.get(CACHE_NAME, cacheKeyForTable);
            var cacheObj = undefined;
            // If cache does not exist, create it.
            if (!cacheStr) {
                var gr = new GlideRecord(tableName);
                if (encodedQuery)
                    gr.addEncodedQuery(encodedQuery);
                gr.query();

                cacheObj = cacheTable(gr, cacheKeyColumn, encodedQuery);
            } else {
                try {
                    cacheObj = JSON.parse(cacheStr);
                } catch (e) {
                    // Flush the cache as it has errors
                    DiscoveryFunctions.flushTableCache(tableName, cacheKeyColumn, encodedQuery);
                    return undefined;
                }
            }

            if (!cacheObj)
                return undefined;

            if (cacheObj.error == TOO_MANY_RECORDS)
                return DiscoveryFunctions.getGlideRecordObjectForCache(tableName, encodedQuery);

            if (cacheObj.error == CANNOT_CACHE)
                throw 'Error: Cannot cache table ' + tableName + '. ' + cacheObj.reason;

            prepareObject();
            return cacheObj;

            function prepareObject() {
                // Closure variables
                var index = -1;
                var records = cacheObj.records;
                // Delete internal usages so caller cannot access it.
                delete cacheObj.records;

                // --- Define object functions: hasNext, next and get.
                cacheObj.hasNext = function() {
                    return (index + 1) < records.length;
                };

                cacheObj.next = function() {
                    // Indicating to end the loop.
                    if (!this.hasNext())
                        return false;

                    return records[++index];
                };

                cacheObj.get = function(fieldName, fieldValue) {
                    // If we only get 1 argument, do the same as GlideRecord and assume the name is sys_id.
                    if (fieldValue === undefined) {
                        fieldValue = fieldName;
                        fieldName = 'sys_id';
                    }

                    return records.find(function(item) {
                        return item[fieldName] == fieldValue;
                    });
                };

                cacheObj.getMultiple = function(fieldName, fieldValue) {
                    // If we only get 1 argument, do the same as GlideRecord and assume the name is sys_id.
                    if (fieldValue === undefined) {
                        fieldValue = fieldName;
                        fieldName = 'sys_id';
                    }

                    var rtnRecords = {};

                    for (var i in records) {
                        var item = records[i];
                        if (item[fieldName] == fieldValue) {
                            var sysId = item.sys_id;
                            rtnRecords[sysId] = item;
                        }
                    }

                    return rtnRecords;
                };

                cacheObj.getAllRecords = function() {
                    var rtnRecords = {};

                    for (var i in records) {
                        var item = records[i];
                        var sysId = item.sys_id;
                        rtnRecords[sysId] = item;
                    }

                    return rtnRecords;
                };

                cacheObj.getValue = function(fieldName) {
                    if (index < 0)
                        return null;

                    return records[index][fieldName];
                };
            }
        };

    DiscoveryFunctions.getGlideRecordObjectForCache = function(tableName, encodedQuery) {
        var gr = new GlideRecord(tableName);
        if (encodedQuery)
            gr.addEncodedQuery(encodedQuery);

        var queried = false;

        var cacheObj = {
            queryOnce: function() {
                if (!queried) {
                    gr.query();
                    queried = true;
                }
            },
            hasNext: function() {
                this.queryOnce();
                return gr.hasNext();
            },
            next: function() {
                this.queryOnce();
                if (!gr.hasNext())
                    return undefined;

                gr.next();
                return DiscoveryFunctions.glideRecordToObject(gr);
            },
            get: function(fieldName, fieldValue) {
                var newGr = new GlideRecord(tableName);

                // If we only get 1 argument, do the same as GlideRecord and assume the name is sys_id.
                if (fieldValue === undefined) {
                    fieldValue = fieldName;
                    fieldName = 'sys_id';
                }

                if (!newGr.get(fieldName, fieldValue))
                    return undefined;

                return DiscoveryFunctions.glideRecordToObject(newGr);
            },
            getMultiple: function(fieldName, fieldValue) {
                return this.getRecords(true, fieldName, fieldValue);
            },
            getAllRecords: function() {
                return this.getRecords(false);
            },
            getRecords: function(condition, fieldName, fieldValue) {
                // If we only get 1 argument, do the same as GlideRecord and assume the name is sys_id.
                if (condition && fieldValue === undefined) {
                    fieldValue = fieldName;
                    fieldName = 'sys_id';
                }

                // Setup
                this.queryOnce();
                var rtnRecords = {};
                gr.saveLocation();
                gr.setLocation(-1);
                while (gr.next()) {
                    if (condition) {
                        if (gr.getValue(fieldName) == fieldValue) {
                            var sysId = gr.getValue('sys_id');
                            rtnRecords[sysId] = DiscoveryFunctions.glideRecordToObject(gr);
                        }
                    } else { // No condition - just get all records.
                        var sysId = gr.getValue('sys_id');
                        rtnRecords[sysId] = DiscoveryFunctions.glideRecordToObject(gr);
                    }
                }

                gr.restoreLocation();
                return rtnRecords;
            },
            getValue: function(fieldName) {
                return gr.getValue(fieldName);
            },
        };

        return cacheObj;
    };

    /*
        This method returns an object representing the records from a table based on a key (that used for this cache).
        @param: tableName: the cached table to get
        @param: searchValue: the specific key value you are looking for. For example: a specific sys_id.
        @param: searchColumn: the name of the column to search the searched value on. For example 'sys_id'
        @param: encodedQuery: an encoded query in case we don't need the enitre table
        @return if the return value is singolar, return a string.
                If there are multiple values to return the return value would be an object:
                    {
                        "<value1>": "1",
                        "<value2>": "0",
                        .
                        .
                        .
                    }
    */
    DiscoveryFunctions.getRecordsForTable = function(tableName, searchValue, searchColumn, encodedQuery, getAllRecords) {
        var cacheObj = DiscoveryFunctions.getCacheObjectForTable(tableName, searchColumn, encodedQuery);
        if (!cacheObj || cacheObj.error)
            return undefined;

        if (getAllRecords)
            return cacheObj.getAllRecords();

        if (searchValue)
            return cacheObj.getMultiple(searchColumn, searchValue);

        return cacheObj;
    };

    DiscoveryFunctions.getAllRecordsForTable = function(tableName, searchColumn, encodedQuery) {
        return DiscoveryFunctions.getRecordsForTable(tableName, undefined, searchColumn, encodedQuery, true);
    };

    /*
        This method returns the first value requested from a table based on a key (that used for this cache).
        @param: tableName: the table name requested.
        @param: searchValue: the specific key value you are looking for. For example: a specific sys_id. 
        @param: searchColumn: the name of the column to search the searched value on. For example 'sys_id'
        @param: valueColumn: After finding the record using the searchValue and searchColumn, return the specific value on this column.
        @param: encodedQuery: an encoded query in case we don't need the enitre table
    */
    DiscoveryFunctions.getFirstValueFromTable = function(tableName, searchValue, searchColumn, valueColumn, encodedQuery) {
        var cacheObj = DiscoveryFunctions.getCacheObjectForTable(tableName, searchColumn, encodedQuery);
        if (!cacheObj)
            return undefined;

        valueColumn = valueColumn || 'sys_id';

        var rtn = cacheObj.get(searchColumn, searchValue);
        if (rtn)
            return rtn[valueColumn];

        return undefined;
    };

    /*
        This method returns true if it could find a specific value in a table, otherwise false.
        @param: tableName: the cached table to get
        @param: searchValue: the specific key value you are looking for. For example: a specific sys_id. 
        @param: searchColumn: the name of the column to search the searched value on. For example 'sys_id'
        @param: valueColumn: After finding the record using the searchValue and searchColumn, return the specific value on this column.
        @param: value: the specific value we are looking for for the specific value column.
        @param: encodedQuery: an encoded query in case we don't need the enitre table
        @param: checkActive: if true: checks if the record is set to active as well
        @return true if an input item was found in a table, otherwise false.
        */
    DiscoveryFunctions.isValueInTable = function(tableName, searchValue, searchColumn, valueColumn, value, checkActive, encodedQuery) {
            var rtn = DiscoveryFunctions.getRecordsForTable(tableName, searchValue, searchColumn, encodedQuery);

            if (!rtn || rtn.error === NO_VALUE)
                return false;

            for (var k in rtn) {
                var item = rtn[k];
                if (item[valueColumn] == value) {
                    if (!checkActive)
                        return true;
                    if (item['active'] == '1')
                        return true;
                }
            }

            return false;
        },

        //This method returns a unique cache key for a given table and a column.
        DiscoveryFunctions.getCacheKeyForTable = function(tableName, cacheKeyColumn, encodedQuery) {
            var key = tableName;
            if (cacheKeyColumn)
                key += '__' + cacheKeyColumn;
            if (encodedQuery)
                key += '__' + encodedQuery;
            return key;
        };

    // This method returns the sys_name from the cmdb_rel_type by a given sys_id.
    DiscoveryFunctions.getRelationshipNameBySysId = function(relSysId) {
        var rtnName = DiscoveryFunctions.getFirstValueFromTable('cmdb_rel_type', relSysId, 'sys_id', 'sys_name');
        if (!rtnName || rtnName.error === NO_VALUE)
            return undefined;

        return rtnName;
    };

    // This mehtod returns true if a specific classifier uses an HD pattern
    DiscoveryFunctions.isAProcessClassificationUsingPatterns = function(classy) {
        var hdProbeId = '4f64c6389f230200fe2ab0aec32e7068';

        return !DiscoveryFunctions.isITOMContentServiceRecord(classy) && DiscoveryFunctions.isValueInTable('discovery_classifier_probe', classy, 'classy', 'child', hdProbeId, true);
    };

    DiscoveryFunctions.isITOMContentServiceRecord = function(classy) {
        var classyGR = new GlideRecord('discovery_classy_proc');
        if (!classyGR.get('sys_id', classy))
            return false;

        var category = classyGR.getValue('product_categories');
        return category != null;
    };

    DiscoveryFunctions.getClassifierProbes = function(classy, checkActive) {
        var obj = DiscoveryFunctions.getRecordsForTable('discovery_classifier_probe', classy, 'classy');
        if (!checkActive || !obj)
            return obj;

        var rtn = {};
        for (var i in obj) {
            var item = obj[i];
            if (item.active == '1')
                rtn[i] = item;
        }

        return rtn;
    };

    DiscoveryFunctions.getMaxTableSizeToCache = function() {
        return MAX_TABLE_SIZE_TO_CACHE;
    };

    // THIS IS FOR TESTING PURPOSES - DO NOT USE - WILL ONLY CHANGE THE VALUE PER SCRIPT DURATION
    DiscoveryFunctions.setMaxTableSizeToCache = function(maxSize) {
        MAX_TABLE_SIZE_TO_CACHE = maxSize;
    };

    // Check if a table has a caching pair to our cache (discovery_table_cache)
    DiscoveryFunctions.doesTableHaveCachePair = function(tableName) {
        var scopedCachePairsGr = new GlideRecord('sys_scoped_cache_table_pair');
        scopedCachePairsGr.addQuery('scoped_cache', '489e70ccffe665108ec45897d53bf1d0'); // discovery_table_cache sys id
        scopedCachePairsGr.addQuery('table', tableName);
        scopedCachePairsGr.query();

        // Missing how to invalidate the cache.
        return scopedCachePairsGr.hasNext();
    };

    /*
     * DEF0751438: Moved logic from DiscoveryHostUtils to here because of dependency issues.
     * We have multiple places that have this similar logic being called
     * Ex. Discovery calls "getIPsInCI" while DiscoveryHostUtils calls "getIpsForCi"
     * So in order to not break anything, we are keeping existing functionalities but
     * moving this main function in here so that different plugins can access
     */
    DiscoveryFunctions.getIpsForCi = function(ciSysId) {
        var gr = new GlideRecord('cmdb_ci');

        if (!ciSysId || !gr.get('sys_id', ciSysId))
            return [];
        var ips = {};

        if (JSUtil.notNil(gr.ip_address))
            ips[gr.ip_address + ''] = true;

        var ipgr = new GlideRecord('cmdb_ci_ip_address');
        ipgr.addQuery('nic.cmdb_ci', ciSysId);
        ipgr.addQuery('nic.install_status', '!=', 100);
        ipgr.addQuery('install_status', '!=', 100);
        ipgr.query();

        while (ipgr.next())
            ips[ipgr.ip_address + ''] = true;

        return Object.keys(ips);
    };

    // PRIVATE METHODS

    /**
     * Checks if a table can be cached.
     * There are 2 checks:
     * 1. If the table name is in our allow list.
     * 		The reason for this as we want the engineer that uses this to know what is needed.
     * 		Generally there are 2 conditions that a table needs to go in order for an engineer to consider caching it:
     * 			a. The table is small (few hundreds of records tops, look at MAX_TABLE_SIZE_TO_CACHE)
     * 			b. The table is not changing frequently, changing a table will flush the cache and will make the cache
     * 				inefficient and counterproductive
     * 		Also: please note, if you are choosing to use encoded query for your table caching: make sure that the
     * 			query is also static and used frequently, otherwise it might be better to cache the table and use
     * 			the API or searching for values to get the data needed programmatically.
     * 2. The table must have a record in sys_scoped_cache_table_pair that is mapped to discovery_table_cache (our cache).
     * 		This is used to make sure we flush the cache every time there is a change to the table.
     * 		When using a cache - make sure the table is not being changed frequently.
     * 
     */
    function isTableValidForCaching(tableName) {
        var allowList = ['discovery_classifier_probe', 'discovery_classy_proc', 'cmdb_rel_type'];
        if (allowList.indexOf(tableName) < 0) {
            return {
                cache: false,
                error: tableName + ' is not in the allowed cached tables.'
            };
        }

        if (!DiscoveryFunctions.doesTableHaveCachePair(tableName)) {
            return {
                cache: false,
                error: tableName + ' does not have a record in sys_scoped_cache_table_pair.'
            };
        }

        return {
            cache: true
        };
    }

    /*
        This method caches a table in the discovery_table_cache cache.
        Considerations:
            1. Please notice we can only cache up to 100 tables at a time in a cache.
                Please be careful with caching. Instance memory is extremely limited
                and every byte you cache is a byte that not's available for some other cache.
            2. We store the entire table (after query) in the node's memory with all the fields.
                Please only cache small tables.
                To limit the fields cache, you can add enquded query.
				Plesae note: if you call the same table with different enquded queires, multiple items will be created in the cahce.
				Consider caching the entire table and filtering in memory.
            3. You MUST add a record to sys_scoped_cache_table_pair table linking
                your new table and discovery table cache = "discovery_table_cache"
        Please keep updating this list so we know which tables are cached and if we are close to the 100 limit.
        Tables we cache:
            1. discovery_classifier_probe
            2. discovery_classy_proc
            3. cmdb_rel_type (where key  is sys_id)
            4. cmdb_rel_type (where key  is name)
        @param gr: the GlideRecord, already quried and ready for next() method.
        @param cacheKeyColumn: The column name as the key of the cache, it will also used for the cahce name for cases where we might need the same table with different keys.
        @param encodedQuery: if not empty, save on the cache object so we know which query used to get this result.
        @return an object in the following structure for ease search-ability (supports for multi-result):
            {
                "<gr.getValue(cacheKeyColumn)>" : {
                    "<gr field name>": "<gr field value>",
                    .
                    .
                    .
                },
                "<gr.getValue(cacheKeyColumn)>": {
                    .
                    .
                    .
                }
            }
		
		Example:
            {
                "1f0340dad7722100a866ee5b5e610357": {
                    "sys_id": "1f0340dad7722100a866ee5b5e610357",
                    "name": "NGINX",
                    <rest of the table fields and values>
                },
                "7023625a7fe022004e83e2065f2a0cb8": {
                    "sys_id": "7023625a7fe022004e83e2065f2a0cb8",
                    "name": "Docker Engine",
                    <rest of the table fields and values>
                }
            }
    */
    function cacheTable(gr, cacheKeyColumn, encodedQuery) {
        if (!gr)
            return;

        if (!cacheKeyColumn)
            cacheKeyColumn = 'sys_id';

        var tableName = gr.getTableName();
        var cacheObj = {};
        var scanned = false;
        // The key is table + cache key (a column in the table) to enable saving multiple entries for 1 table.
        var cacheKeyForTable = DiscoveryFunctions.getCacheKeyForTable(tableName, cacheKeyColumn, encodedQuery);

        // Validate the cache
        var canCacheTable = isTableValidForCaching(tableName);

        if (!canCacheTable.cache) {
            cacheObj.error = CANNOT_CACHE;
            cacheObj.reason = canCacheTable.error;
        }

        // Some memory protection if someone will try to cache more than we want.
        if (gr.getRowCount() > MAX_TABLE_SIZE_TO_CACHE)
            cacheObj.error = TOO_MANY_RECORDS;

        // If error, cache the error and move on.
        if (cacheObj.error) {
            sn_scoped_cache.ScopedCacheManager.put(CACHE_NAME, cacheKeyForTable, JSON.stringify(cacheObj));
            return cacheObj;
        }

        cacheObj.records = [];
        while (gr.next()) {
            scanned = true;
            cacheObj.records.push(DiscoveryFunctions.glideRecordToObject(gr));
        }

        if (!scanned)
            cacheObj.empty = true;

        sn_scoped_cache.ScopedCacheManager.put(CACHE_NAME, cacheKeyForTable, JSON.stringify(cacheObj));

        // returns the cached object.
        return cacheObj;
    }

}());

Object.freeze(DiscoveryFunctions);
Object.freeze(DiscoveryFunctions.prototype);
