var ScopedApiBridge = {

  "GlideExecutionTracker": {
    cancelTracker: function(sys_id, message) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			var gx = new SNC.GlideExecutionTracker(sys_id);
			gx.cancel(message);
		},
	updateMessage: function(sys_id, message) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			var gx = new SNC.GlideExecutionTracker(sys_id);
			gx.updateMessage(message);
		}
  },

  	"TableUtils": {
		getTableHierarchyCSV: function(table) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;
			
			var tU = new TableUtils(table);
			var tableArrayList = tU.getTables();
			gs.include("j2js");
			var tableArray = j2js(tableArrayList);
			return tableArray.join(",");
		}
	},

	"gs": {

		userHasRole: function(userSysId, roleName) {
      		if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			return !!gs.getUser().getUserByID(userSysId).hasRole(roleName);
    	},

    	getMessage: function(message) {
      		if (gs.getCallerScopeName() != "sn_atf_tg")
				return;
      
			gs.include("j2js");
      		return j2js(gs.getMessage(message));
    	},

		putSessionProperty: function(key, value) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			var session = gs.getSession();
			session.putProperty(key, value);
		},
		
		getSessionProperty: function(key) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			var session = gs.getSession();
			return session.getProperty(key);
		},
		
		getSystemId: function() {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;
			gs.include("j2js");
			return j2js(gs.getSystemID());
		},
        
        warn: function(message, error) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			gs.warn(message, error);
		},

        error: function(message, error) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

           gs.error(message, error);
		},

		print: function(message) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			gs.print(message);
		},

		getRoles: function() {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			gs.include("j2js");
			var roles = j2js(gs.getSession().getRoles().toString())
			return roles.split(",");
		},
		
		sleep: function(ms) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			gs.sleep(ms);
		},

		getProperty: function(name, defaultValue) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			gs.include("j2js");
			return j2js(gs.getProperty(name, defaultValue));
		},

		setProperty: function(name, value) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			gs.setProperty(name, value);
		}

	},
	FunktionConstructor: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return Function.apply(null, arguments);
	},
	
	ObjectDefineProperty: function(obj, prop, args) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return Object.defineProperty(obj, prop, args);
	},
	
	TableDescriptor: {
		getActiveTableFields: function(table) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			var td = new GlideTableDescriptor(table);
			var fields = td.getActiveFieldNames();
			gs.include("j2js");
			return j2js(fields);
		},

		isValidField: function(table, field) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			var td = new GlideTableDescriptor(table);
			return !!td.isValidField(field);
		},

    getType: function(table, field) {
      if (gs.getCallerScopeName() != "sn_atf_tg")
			  return;
      
      var td = new GlideTableDescriptor(table);
      var ge = td.getElementDescriptor(field);
	  gs.include("j2js");
      return j2js(ge.getInternalType());
    },

    isChoice: function(table, field) {
      if (gs.getCallerScopeName() != "sn_atf_tg")
			  return;
      
      var td = new GlideTableDescriptor(table);
      var ge = td.getElementDescriptor(field);
      return !!ge.isChoiceTable();
    },

    getActualTable: function(table, field) {
      if (gs.getCallerScopeName() != "sn_atf_tg")
			  return;
     
      var td = new GlideTableDescriptor(table);
      var ge = td.getElementDescriptor(field);
	  gs.include("j2js");
      return j2js(ge.getFirstTableName());
    },

    hasUniqueIndex: function(table, field) {
      if (gs.getCallerScopeName() != "sn_atf_tg")
			  return;

      var td = new GlideTableDescriptor(table);
      var indexes = td.getIndexDescriptors();
      return !!(indexes.get(field) !== null && indexes.get(field).isUnique());
    },

    getReferenceQualifier: function(table, field) {
      if (gs.getCallerScopeName() != "sn_atf_tg")
			  return;

      var td = new GlideTableDescriptor(table);
      var ge = td.getElementDescriptor(field);
	  gs.include("j2js");
      var reference = j2js(ge.getReferenceQualifier());
	  if (reference === null)
		return null;

	  return reference
    },
    
    getTableLabel: function(table) {
      if (gs.getCallerScopeName() != "sn_atf_tg")
			  return;

      var td = new GlideTableDescriptor(table);
	  gs.include("j2js");
      return j2js(td.getLabel());
    },

    getDependent: function(table, field) {
      if (gs.getCallerScopeName() != "sn_atf_tg")
			  return;
      
      var td = new GlideTableDescriptor(table);
      var ge = td.getElementDescriptor(field);
	  gs.include("j2js");
      return j2js(ge.getDependent());
    },

    getFieldDictionary: function(table, field) {
      if (gs.getCallerScopeName() != "sn_atf_tg")
			  return;
      
      var td = new GlideTableDescriptor(table);
      var ge = td.getElementDescriptor(field);
      var indexes = td.getIndexDescriptors();

      var name = ge.getFirstTableName(); // Maybe just getTableName()?
      var type = ge.getInternalType();
      var reference = ge.getReference();
      var element = ge.getColumnName();
      var dependent = ge.getDependent();
      var attributes = ge.serializeAttributes();
      var unique = indexes.get(field).isUnique();
      var max_length = ge.getLength();
      var scope = ge.getScopeId();
      return {
        name: name,
        type: type,
        reference: reference,
        element: element,
        dependent: dependent,
        attributes: attributes,
        unique: unique,
        max_length: max_length,
        scope: scope
      }
    },

    getReference: function(table, field) {
    if (gs.getCallerScopeName() != "sn_atf_tg")
      return;
    
    var td = new GlideTableDescriptor(table);
    var ge = td.getElementDescriptor(field);
	gs.include("j2js");
    return j2js(ge.getReference());
    },

	isUpdateSynch: function(table) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var td = new GlideTableDescriptor(table);

		// Did this b/c I do not trust values returned from java, they have caused issues in the past
		if (td.isUpdateSynch())
			return true;
		return false;
	}
  },

  DBObjectManager: {
    getChildren: function(table) {
    	if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		gs.include("j2js");
    	var children = j2js(GlideDBObjectManager.get().getTableExtensions(table));
		return children;
    },

    getParents: function(table) {
    	if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var tables = j2js(GlideDBObjectManager.get().getTables(table));
    	return tables;
    }
  },
	
	Funktion: {
		applye: function(funktion, thisArg, argsArray) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			return funktion.apply(thisArg, argsArray);
		}
	},

	throwableParser: function(e) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var stackTraceElements = e.getStackTrace();
   		var stacktrace = "";
   		for (var x = 0; x < stackTraceElements.length; x++) {
      		stacktrace += (stackTraceElements[x] + "\n");
   		}
   		return (e.toString() + "\n" + stacktrace);
	},
	
	ActionUtilsBridge: {
		postInsert: function(gr) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			gs.include('ActionUtils');
			var au = new ActionUtils();
        	au.postInsert(gr);
		}
	},

	GlideUpdateSetBridge: {
		set: function(updateSetGr) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			new GlideUpdateSet().set(updateSetGr.sys_id);
		},

		get: function() {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			gs.include("j2js");
			return j2js(new GlideUpdateSet().get());
		}
	},

	CacheManager: {
		get: function(cache, key) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			return GlideCacheManager.get(cache, key);
		},
		
		put: function(cache, key, value) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			GlideCacheManager.put(cache, key, value);
		}
	},
	
	StopWatch: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		function StopWatch() {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			this.stopWatch = new GlideStopWatch();
		}
		
		StopWatch.prototype.getValue = function() {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			gs.include("j2js");
			return j2js(this.stopWatch.toString());
		};
		
		return StopWatch;
	}(),
	
	ClusterMessage: {
		postScript: function(script) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			GlideClusterMessage.postScript(script);
		}
	},
	
	ViewManager: {
		getFormViewsForTable: function(table) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			var viewManager = new GlideScriptViewManager(null);
			viewManager.setTable(table);
			viewManager.setTarget("section");
			var cl = viewManager.getList();
			return new JSON().decode(cl.toJSON());
		}
	},

	GlideController: {
		putGlobal: function(name, value) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			GlideController.putGlobal(name, value);
		},

		evaluateString: function(script) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			gs.include("j2js");
			return j2js(GlideController.evaluateString(script));
		}
	},

	GlideRecord: {
		deleteRecord: function(table, sysId) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			var gr = new GlideRecord(table);
			gr.get(sysId);
			gr.deleteRecord();
		}
	},

	impersonate: function(userSysId) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		gs.getSession().onlineImpersonate(userSysId);
	},

	onlineUnimpersonate: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		gs.getSession().onlineUnimpersonate();
	},

	updateSetExporter: function(updateSetSysId) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var updateSetGr = new GlideRecord("sys_update_set");
		updateSetGr.get(updateSetSysId);
		var updateSetExport = new UpdateSetExport();
		var sysid = updateSetExport.exportUpdateSet(updateSetGr);
		gs.include("j2js");
		return j2js(sysid);
	},

	httpPostRequest: function(url, credentials, body, headers) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var request = new GlideHTTPRequest(url);
		request.setBasicAuth(credentials.username, credentials.password);
		for (var headerName in headers)
			request.addHeader(headerName, headers[headerName]);
		var response = request.post(body);
		return {
			body: response.getBody(),
			status: response.getStatusCode()
		};
	},

	GlideTransactionManager: {
		kill: function(sessionId) {
			if (gs.getCallerScopeName() != "sn_atf_tg")
				return;

			GlideTransactionManager.kill(sessionId);
		}
	},

	updateCertificateStatus: function(gr) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return new SNC.GlideCACertificateUploader().getCertificateUploadStatus(gr);
	},

};
