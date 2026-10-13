// Discovery
gs.include('PrototypeServer');
gs.include('AbstractReconciler');

var GenericUPSBypassReconciler = Class.create();

GenericUPSBypassReconciler.prototype = Object.extend(new AbstractReconciler(), {
    initialize: function(sysID, discovered) {
        // database record fields...
        this.dbLineIndex = null;
        this.dbVoltage   = null;
        this.dbCurrent   = null;
        this.dbPower     = null;
        
        // discovered record fields...
        this.dsLineIndex = null;
        this.dsVoltage   = null;
        this.dsCurrent   = null;
        this.dsPower     = null;
        
        this._initialize('cmdb_ci_ups_bypass', 'ups_parent', sysID, discovered);
    },

    readDatabaseFields: function() {
        this.dbLineIndex = this.getInt(   'bypass_index'   );
        this.dbVoltage   = this.getFloat( 'bypass_volt'    );
        this.dbCurrent   = this.getFloat( 'bypass_current' );
        this.dbPower     = this.getFloat( 'bypass_power'   );
    },

    setDatabaseFields: function() {
        this.set( 'bypass_index',   this.dsLineIndex );
        this.set( 'bypass_volt',    this.dsVoltage   );
        this.set( 'bypass_current', this.dsCurrent   );
        this.set( 'bypass_power',   this.dsPower     );
    },

    readDiscovered: function() {
        this.dsLineIndex = this.getDsInt(   'upsBypassLineIndex' );
        this.dsVoltage   = this.getDsFloat( 'upsBypassVoltage'   );
        this.dsCurrent   = this.getDsFloat( 'upsBypassCurrent'   );
        this.dsPower     = this.getDsFloat( 'upsBypassPower'     );
        return true;
    },

    getReconcilationField: function() {
        return 'upsBypassLineIndex';
    },

    getReconcilationKey: function() {
        return this.dbLineIndex;
    },

    hasChanged: function() {
        var changed = this.areNotEqual( this.dsVoltage, this.dbVoltage );
        changed |=    this.areNotEqual( this.dsCurrent, this.dbCurrent );
        changed |=    this.areNotEqual( this.dsPower,   this.dbPower   );
        return changed;
    },

    type: 'GenericUPSBypassReconciler'
});
