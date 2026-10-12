//This class handles checking for any condition checks that are defined on a contract
gs.include("PrototypeServer");

var ConditionChecks = Class.create();
ConditionChecks.prototype = {
    
    initialize: function() {
        this.checks = new Array(); // 2 dimension array [field].[check]
		this.allChecks = []; //Stores All checks irrespective of table to handle overriden checks
        this.tableNames = {};
        this.debug = false;
		this.delimiter = '#';
		this.tableHierarchy = {};
		this.checkOverrideEnabled = global.ModelUtils.isDomainSeparationEnabled() ? false: gs.getProperty('contract_compliance_check_job.enable_override');
    },
    
    /**
     * Check conditions for the specified table
     */
    check: function(checkTableName) {
        this._getChecks(checkTableName);
		var enableBatching = gs.getProperty('contract_compliance_check_job.batching');
		if(enableBatching === 'true') {
			var batchSize = gs.getProperty('contract_compliance_check_job.batchSize');
			this.processInBatches(checkTableName, batchSize);
		} else {
			//Process each record individually
			var gr = new GlideRecord(checkTableName);
			if (gr.isValid()) {
				gr.query();
				while (gr.next()) {
						this._checkRecord(gr, checkTableName);
				}
			}
		}
    },
    
    /**
     * Check conditions for all tables specified in the clm_condition_check table
     */
    checkAll: function() {
        this._getTableNames();
        for (tableName in this.tableNames) {
            this.check(tableName);
        }
    },
    
    
    /**
     * Check the condition for a single record, record should be an instanceOf(tb)
     */
    checkRecord: function(gr, cls) {
        if (JSUtil.nil(gr))
            return;
        
        if (cls == undefined){
            this._getChecks( gr.getTableName());
        } else {
            if (!gr.instanceOf(cls)) {
                gs.log("***** ERROR *****: The GlideRecord passed to checkRecord has to be the instance of the class passed as parameter");
                return;
            }
            this._getChecks(cls);
        }
        this._checkRecord(gr);
    },
    
    /**
     * Check the condition for a single record when we have already read the condition checks for the table
     * DSZ - checks are grouped by check.field and executed until the first check for the field is triggered
     *
     */
    _checkRecord: function(gr, checkTableName) {
        var check = null;
        var checksLen = 0;
        var fieldType = '';
        
        // loop through the field name array
        for (var f in this.checks) {
            checksLen = this.checks[f].length;
			var currTableClass = gr.sys_class_name.toString();
			//Dont execute the check on child tables for which there is a separate check on same field
			if(JSUtil.nil(checkTableName) || checkTableName === currTableClass ||  !this._skipCheckExecution(currTableClass, checkTableName, f)) {
				// loop through the checks for field and stop at first natching
				for (var j = 0; j < checksLen; j++) {
					check = this.checks[f][j];
					if (this._checkFilter(gr, check.table, check.filter)){
						//if (check.matcher.match(gr, true)) {
						this.updateRecord(check, gr);
						break;
					}
				} // for through checks
			}
		} // for through field
    },

        _checkFilter: function(gr, table, filter) {
            var cr = new GlideRecord(table);
            cr.addEncodedQuery(filter);
            cr.addQuery('sys_id', gr.sys_id);
            cr.query();
            if (cr.getRowCount() == 1)
                return true;
            else
                return false;
        },

        /**
         * Get all of the tables that are specified in the expiration definition
         */
        _getTableNames: function() {
            this.tableNames = {};
            var gr = new GlideRecord("clm_condition_check");
            gr.query();
            while (gr.next()) {
                this.tableNames[gr.table.toString()] = true;
            }
        },

        /**
         * Get all checks defined irrespective of table.
		 * Required to identify overriden checks in child tables
		 * returns an array containing tableName+fieldName for each check
         */
		_getAllChecks: function() {
			this.allChecks = [];
			new global.GlideQuery('clm_condition_check')
			.select('table', 'condition_field')
			.forEach(function(check) {
				this.allChecks.push(check.table.toString() + this.delimiter + check.condition_field.toString());
			}.bind(this));
		},

        /**
         * Get hierarchy Map for each table in the extension list
		 * of the current table on which job is running
		 * returns a string:array map containing tableName : table hierarchy array
         */
		_getTableHierarchyMap: function(checkTableName) {
			var allExtns = j2js(new global.TableUtils(checkTableName).getTableExtensions());
			for(var tab in allExtns) {
				this.tableHierarchy[allExtns[tab]] = j2js(new global.TableUtils(allExtns[tab]).getTables());
			}
		},

        /**
         * When running job for Parent table check, while processing an extension record
		 * If a check exists closer in the hierarchy to child table, we skip parent check
		 * returns true or false
         */
		_skipCheckExecution: function(currTableClass, checkTableName, field) {
			if(!this.checkOverrideEnabled) {
				return false;
			}
			var index = this.tableHierarchy[currTableClass].indexOf(checkTableName);
			for(var i = 0; i < index; i++) {
				if(this.allChecks.indexOf(this.tableHierarchy[currTableClass][i] + this.delimiter + field)  != -1) {
					return true;
				}
			}
			return false;
		},

        /**
         * Get the condition checks for the specified table
         * DSZ - added the loop if many checks for the same table
         */
        _getChecks: function(checkTableName) {
			if(this.checkOverrideEnabled) {
				this._getAllChecks();
				this._getTableHierarchyMap(checkTableName);
			}
            this.checks = [];
            var eventName = '';
            // see if the condition has an overall event name
            var gr = new GlideRecord('clm_condition_check');
            gr.initialize();
            gr.addQuery('table', checkTableName);
            gr.orderBy('order');
            gr.query();
            while (gr.next()) {
                eventName = gr.event_name.toString();
                checkSysId = gr.sys_id.toString();
                var fieldName = gr.condition_field.toString();
                this.checks[fieldName] = new Array();
                // now get the checks and put them in sub-array
                var grCh = new GlideRecord('clm_condition_checker');
                grCh.initialize();
                grCh.addQuery('condition_check', checkSysId);
                grCh.orderBy('order');
                grCh.query();
                while (grCh.next()) {
                    var check = {}; //create new object
					check.name = grCh.name.toString();
                    check.sys_id = (check.name == '')? '' : grCh.sys_id.toString();
                    check.field = fieldName;
                    check.table = grCh.table;
                    check.filter = grCh.condition.toString();
                    check.matcher = new GlideFilter(grCh.condition, "condition");
                    if (grCh.event_name) {
                        check.event_name = grCh.event_name.toString();
                    } else {
                        check.event_name = eventName;
                    }
                    this.checks[fieldName].push(check);
                }
            }
        },
		
		/**
         * Process the table record in batches
         */
		processInBatches: function(checkTableName, batchSize) {
			var count = 0;
			var contractArray = [];
			var cGr = new GlideRecord(checkTableName);
			cGr.query();
			while(cGr.next()) {
				contractArray.push(cGr.getUniqueValue());
				count = count + 1;
				if(count == batchSize)
				{
					this.processPerCheck(checkTableName,contractArray);
					count = 0;
					contractArray = [];
					//break;
				}
			}
			if(contractArray.length>0) {
				this.processPerCheck(checkTableName,contractArray);
			}
		},

		/**
         * Process the batch and run all the checks on them
         */
		processPerCheck: function(checkTableName, contractArray) {
			var check = null;
			var checksLen = 0;
			var fieldType = '';
			var gr;
			var recordsToProcess = [];
			// loop through the field name array
			for (var f in this.checks) {
				checksLen = this.checks[f].length;
				recordsToProcess = [];
				recordsToProcess = contractArray.slice();
			
				for (var j = 0; j < checksLen; j++) {
					check = this.checks[f][j];
					gr = new GlideRecord(checkTableName);
					gr.addEncodedQuery(check.filter);
					gr.addQuery('sys_id', 'IN', recordsToProcess);
					gr.query();
					while(gr.next()) {
						recordsToProcess.splice(recordsToProcess.indexOf(gr.getUniqueValue()), 1);
						var currTableClass = gr.sys_class_name.toString();
						//Dont execute the check on child tables for which there is a separate check on same field
						if(checkTableName === currTableClass || !this._skipCheckExecution(currTableClass, checkTableName, f)) {
							this.updateRecord(check, gr);
						}
					}
				}
            }
        },
        
		updateRecord: function(check, gr) {
			var fieldType = gr[check.field].getED().getInternalType();
			if (fieldType == 'reference' && gr[check.field] != check.sys_id) {
				gr[check.field] = check.sys_id;
				gr.update();
				// Notify email notifications
				if (check.event_name) {
					gs.eventQueue(check.event_name, gr, check.sys_id, check.name);
				}
			} else if(fieldType != 'reference' && gr[check.field] != check.name) {
				gr[check.field] = check.name;
				gr.update();
				// Notify email notifications
				if (check.event_name) {
					gs.eventQueue(check.event_name, gr, check.sys_id, check.name);
				}
			}
		},

        z: null
    };
