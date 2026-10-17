// Discovery
gs.include('PrototypeServer');
gs.include('AbstractReconciler');

var GenericUPSOutputsReconciler = Class.create();

GenericUPSOutputsReconciler.prototype = Object.extend(new AbstractReconciler(), {
    initialize: function(sysID, discovered) {
        // database record fields...
        this.dbLineIndex = null;
        this.dbLoad      = null;
        this.dbVoltage   = null;
        this.dbCurrent   = null;
        this.dbPower     = null;
        
        // discovered record fields...
        this.dsLineIndex = null;
        this.dsLoad      = null;
        this.dsVoltage   = null;
        this.dsCurrent   = null;
        this.dsPower     = null;
        
        this._initialize('cmdb_ci_ups_output', 'ups_parent', sysID, discovered);
    },

    readDatabaseFields: function() {
        this.dbLineIndex = this.getInt(   'output_index'   );
        this.dbLoad      = this.getFloat( 'output_load'    );
        this.dbVoltage   = this.getFloat( 'output_volt'    );
        this.dbCurrent   = this.getFloat( 'output_current' );
        this.dbPower     = this.getFloat( 'output_power'   );
    },

    setDatabaseFields: function() {
        this.set( 'output_index',   this.dsLineIndex );
        this.set( 'output_load',    this.dsLoad      );
        this.set( 'output_volt',    this.dsVoltage   );
        this.set( 'output_current', this.dsCurrent   );
        this.set( 'output_power',   this.dsPower     );
    },

    readDiscovered: function() {
        this.dsLineIndex = this.getDsInt(   'upsOutputLineIndex'   );
        this.dsLoad      = this.getDsFloat( 'upsOutputPercentLoad' );
        this.dsVoltage   = this.getDsFloat( 'upsOutputVoltage'     );
        this.dsCurrent   = this.getDsFloat( 'upsOutputCurrent'     );
        this.dsPower     = this.getDsFloat( 'upsOutputPower'       );
        return true;
    },

    getReconcilationField: function() {
        return 'upsOutputLineIndex';
    },

    getReconcilationKey: function() {
        return this.dbLineIndex;
    },

    hasChanged: function() {
        var changed = this.areNotEqual( this.dsLoad,    this.dbLoad    );
        changed |=    this.areNotEqual( this.dsVoltage, this.dbVoltage );
        changed |=    this.areNotEqual( this.dsCurrent, this.dbCurrent );
        changed |=    this.areNotEqual( this.dsPower,   this.dbPower   );
        return changed;
    },

    type: 'GenericUPSOutputsReconciler'
});
