// Discovery
gs.include('PrototypeServer');
gs.include('AbstractReconciler');

var GenericUPSAlarmsReconciler = Class.create();

GenericUPSAlarmsReconciler.prototype = Object.extend(new AbstractReconciler(), {
    initialize: function(sysID, discovered) {
        // database record fields...
        this.dbID   = null;
        this.dbType = null;
        this.dbTime = null;
        
        // discovered record fields...
        this.dsID       = null;
        this.dsType     = null;
        this.dsTime     = null;
        this.dsCategory = null;
        
        this._initialize('cmdb_ci_ups_alarm', 'ups_parent', sysID, discovered);
    },

    readDatabaseFields: function() {
        this.dbID   = this.getString( 'alarm_id_str' );
        this.dbType = this.getString( 'alarm_type'   );
        this.dbTime = this.getInt(    'alarm_time'   );
    },

    setDatabaseFields: function() {
        this.set( 'alarm_id_str', this.dsID   );
        this.set( 'alarm_type',   this.dsType );
        this.set( 'alarm_time',   this.dsTime );
    },

    readDiscovered: function() {
        this.dsID       = this.getDsString(  'upsAlarmId'               );
        this.dsCategory = this.getDsString(  'upsAlarmCategory'         );
        this.dsType     = this.getTypeSysID( this.dsCategory, this.dsID );
        this.dsTime     = this.getDsInt(     'upsAlarmTime'             );
        return true;
    },

    getReconcilationField: function() {
        return 'upsAlarmId';
    },

    getReconcilationKey: function() {
        return this.dbID;
    },

    hasChanged: function() {
        var changed = this.areNotEqual( this.dsID,   this.dbID   );
        changed |=    this.areNotEqual( this.dsType, this.dbType );
        changed |=    this.areNotEqual( this.dsTime, this.dbTime );
        return changed;
    },
    
    getTypeSysID: function(category, id) {
		if (JSUtil.nil(id) || JSUtil.nil(category))
			return null;
		
        // if we have a two part id (separated by a "-"), then use the second part...
        var id_parts = id.split('-');
        if (id_parts.length > 1)
            id_parts[0] = id_parts[1];
            
        // now find our alarm type, if we can...
        var gr = new GlideRecord('ups_alarm');
        gr.addQuery('category', category);
        gr.addQuery('id', id_parts[0]);
        gr.query();
        return gr.next() ? gr.getValue('sys_id') : null;
    },

    type: 'GenericUPSAlarmsReconciler'
});
