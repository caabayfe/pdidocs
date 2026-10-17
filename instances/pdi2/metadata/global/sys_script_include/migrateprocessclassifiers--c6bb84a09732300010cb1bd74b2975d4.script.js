// Discovery

/**
 * Allows migration of old-style process classifiers to the new style (from using separate criteria records to using a condition field). 
 *  
 * The old style exposed the following fields (all from the running process table):
 *   name
 *   command
 *   parameters
 *   pid
 *   ppid
 *   
 * And the following operators were allowed:
 *   contains
 *   does not contain
 *   equals
 *   does not equal
 *   startsWith
 *   does not start with
 *   endsWith
 *   does not end with
 *   regex matches
 *   regex does not match
 *   
 * Then each classifier could choose whether to "and" or "or" all the criteria together, with the match_criteria field being "All" or "Any", respectively.
 * 
 * All of this maps well into the new scheme.  The fields map as follows:
 * 
 *   Old field        New field
 *   ---------------  ----------------
 *   name             name
 *   command          command
 *   parameters       key_parameters
 *   pid              pid
 *   ppid             ppid
 *   
 * The operators map as follows:
 * 
 *   Old operator           New operator
 *   ---------------------  -----------------------
 *   contains               CONTAINS
 *   does not contain       DOES NOT CONTAIN
 *   equals                 =
 *   does not equal         !=
 *   startsWith             STARTSWITH
 *   does not start with    (no mapping)
 *   endsWith               ENDSWITH
 *   does not end with      (no mapping)
 *   regex matches          MATCH_RGX
 *   regex does not match   (no mapping)
 *   in IPs                 (no mapping)
 * 
 * Those old operators that have no mapping to the new will simply be ignored.
 * 
 */
var MigrateProcessClassifiers = Class.create();
MigrateProcessClassifiers.prototype = {
    
    /**
     * Initializes a new instance of this class.
     * 
     * Note the odd translation of "contains" to "LIKE", and "does not contain" to "NOT LIKE".  This strangeness is 
     * necessary due to some bizarro legacy behavior documented in com.glide.db.QueryString.java, in the method
     * comments for convertLikeOperatorToContains().  If this odd behavior ever gets fixed in the platform, all the
     * filters built with the legacy "LIKE" are going to have to be modified... 
     */
    initialize : function() {
        this.op_trans = {
                'equals':               '=',
                'startsWith':           'STARTSWITH',
                'endsWith':             'ENDSWITH',
                'contains':             'LIKE',
                'does not contain':     'NOT LIKE',
                'does not equal':       '!=',
                'does not start with':  null,
                'does not end with':    null,
                'regex matches':        'MATCH_RGX',
                'regex does not match': null,
                'in IPs':               null
                
        };
    },
    
    /**
     * If invoked with an instance of GlideRecord for discovery_classy_proc, then this method will migrate the current record 
     * from the old style to the new style, if it has not already been migrated.  If invoked with any other parameters, converts
     * the first parameter to a string and uses it as the sys_id of the discovery_classy_proc record it's supposed to migrate.
     * If invoked with no parameters, this method will migrate ALL discovery_classy_proc instances from the old style to new style.
     */
    migrate: function(pcgr) {
        // if we were invoked with no parameter, so let's migrate ALL the process classifiers...
        if (!pcgr) {
            var gr = new GlideRecord('discovery_classy_proc');
            gr.addActiveQuery();
            gr.query();
            while (gr.next())
                this.migrate(gr);
        }
        
        // if we got something other than a GlideRecord instance, then convert it to a string and try to load the record, then migrate it...
        else if (!this.isPCGR(pcgr)) {
            var gr = new GlideRecord('discovery_classy_proc');
            if (gr.get('sys_id', '' + pcgr))
                this.migrate(gr);
        }
        
        // otherwise, migrate the instance in the given GlideRecord...
        else {
            gs.log("MigrateProcessClassifiers Processing " + pcgr.name); 
			
			// don't migrate if it's already been done...
            if (!!('' + pcgr.condition))
                return;
            
			gs.log("MigrateProcessClassifiers Migrating(Found a Condition) " + pcgr.name); 
			
            var cgr = this.getCriteriaGR(pcgr);
            var op = ('' + pcgr.match_criteria == 'Any') ? '^OR' : '^';  // get the operator we're using between criteria...
            var condition = '';
            while (cgr.next()) {
                // get our old-style criterion...
                var name = '' + cgr.name;
                var operator = this.op_trans['' + cgr.operator];
                var value = '' + cgr.value;
                
                // if we couldn't map the operator, just skip this...
				gs.log("MigrateProcessClassifiers Found criteria " + name + operator + value); 
                if (!operator)
                    continue;
                
                // If it is a regular expression and starts with '^', remove it due to platform bug
                if (operator == 'MATCH_RGX' && value.charAt(0) == '^')
                    value = value.substring(1);
                
                // add this term to our condition...
                if (condition)
                    condition += op;
                condition += name + operator + value;
                
                // delete this nasty old record, as we don't need it any more...
				gs.log("MigrateProcessClassifiers Converted criteria to condition " + condition); 
                cgr.deleteRecord();
            }
            condition += '^EQ';
            pcgr.condition = condition;
            pcgr.update();
        }
    },
    
    /**
     * Returns a GlideRecord with all the instances of discovery_class_criteria that apply to the given discovery_classy_proc record.
     */
    getCriteriaGR: function(pcgr) {
        var gr = new GlideRecord('discovery_class_criteria');
        gr.addQuery('classy', '' + pcgr.sys_id);
        gr.query();
        return gr;
    },
    
    /**
     * Returns true if the given object is a valid instance of GlideRecord for the discovery_classy_proc table.
     */
    isPCGR: function(obj) {
        if (!obj)
            return false;
        
        try {
            if (!obj.getTableName || !obj.isValid)
                return false;
            
            if ((typeof obj.getTableName != 'function') || (typeof obj.isValid != 'function'))
                return false;
            
            return obj.isValid() && ('discovery_classy_proc' == obj.getTableName());
        }
        catch(err) {
            return false;
        }
    },

    type : 'MigrateProcessClassifiers'
};
