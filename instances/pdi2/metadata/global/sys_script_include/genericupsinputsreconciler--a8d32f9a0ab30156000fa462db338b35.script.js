// Discovery
gs.include('PrototypeServer');
gs.include('AbstractReconciler');

var GenericUPSInputsReconciler = Class.create();

GenericUPSInputsReconciler.prototype = Object.extend(new AbstractReconciler(), {
    initialize: function(sysID, discovered) {
        // database record fields...
        this.dbLineIndex = null;
        this.dbFrequency = null;
        this.dbVoltage   = null;
        this.dbCurrent   = null;
        this.dbPower     = null;
        
        // discovered record fields...
        this.dsLineIndex = null;
        this.dsFrequency = null;
        this.dsVoltage   = null;
        this.dsCurrent   = null;
        this.dsPower     = null;
        
        this._initialize('cmdb_ci_ups_input', 'ups_parent', sysID, discovered);
    },

    readDatabaseFields: function() {
        this.dbLineIndex = this.getInt(   'input_index'   );
        this.dbFrequency = this.getFloat( 'input_freq'    );
        this.dbVoltage   = this.getFloat( 'input_volt'    );
        this.dbCurrent   = this.getFloat( 'input_current' );
        this.dbPower     = this.getFloat( 'input_power'   );
    },

    setDatabaseFields: function() {
        this.set( 'input_index',   this.dsLineIndex );
        this.set( 'input_freq',    this.dsFrequency );
        this.set( 'input_volt',    this.dsVoltage   );
        this.set( 'input_current', this.dsCurrent   );
        this.set( 'input_power',   this.dsPower     );
    },

    readDiscovered: function() {
        this.dsLineIndex = this.getDsInt(   'upsInputLineIndex' );
        this.dsFrequency = this.getDsFloat( 'upsInputFrequency' );
        this.dsVoltage   = this.getDsFloat( 'upsInputVoltage'   );
        this.dsCurrent   = this.getDsFloat( 'upsInputCurrent'   );
        this.dsPower     = this.getDsFloat( 'upsInputTruePower' );
        return true;
    },

    getReconcilationField: function() {
        return 'upsInputLineIndex';
    },

    getReconcilationKey: function() {
        return this.dbLineIndex;
    },

    hasChanged: function() {
        var changed = this.areNotEqual( this.dsFrequency, this.dbFrequency );
        changed |=    this.areNotEqual( this.dsVoltage,   this.dbVoltage   );
        changed |=    this.areNotEqual( this.dsCurrent,   this.dbCurrent   );
        changed |=    this.areNotEqual( this.dsPower,     this.dbPower     );
        return changed;
    },

    type: 'GenericUPSInputsReconciler'
});
