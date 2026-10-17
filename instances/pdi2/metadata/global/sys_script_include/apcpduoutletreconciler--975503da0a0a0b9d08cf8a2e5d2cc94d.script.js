// Discovery

var ApcPduOutletReconciler = Class.create();

ApcPduOutletReconciler.prototype = Object.extend(new AbstractReconciler(), {
    initialize: function(sysId, discovered){
        // database fields
        this.dbOutletName = null;
        this.dbOutletState = null;
        this.dbOutletCommmandPending = null;
        
        // discovered fields
        this.dsOutletName = null;
        this.dsOutletState = null;
        this.dsOutletCommandPending = null;
        
        discovered.first();
        this._initialize('cmdb_ci_pdu_outlet', 'cmdb_ci_pdu', sysId, discovered);

    },

    readDatabaseFields: function(){
        this.dbOutletName = this.getString('name');
        this.dbOutletState = this.getString('state');
        this.dbOutletCommandPending = this.getString('outlet_command_pending');
    },
    
    setDatabaseFields: function(){
        this.set( 'name', this.dsOutletName );
        this.set('state', this.dsOutletState );
        this.set( 'outlet_command_pending', this.dsOutletCommandPending);
    },
    
    readDiscovered: function(){
        this.dsOutletName = this.getDsString( 'rPDUOutletStatusOutletName' );
        this.dsOutletState = this.getDsString( 'rPDUOutletStatusOutletState' );
        this.dsOutletCommandPending = this.getDsString( 'rPDUOutletStatusCommandPending' );
        return true;
    },
    
    getReconcilationField: function(){
        return 'rPDUOutletStatusOutletName';
    },
    
    getReconcilationKey: function(){
        return this.dbOutletName;
    },
    
    hasChanged: function(){
        var changed  = this.areNotEqual( this.dsOutletName, this.dbOutletName);
        changed |= this.areNotEqual( this.dsOutletState, this.dbOutletState);
        changed |= this.areNotEqual( this.dsOutletCommandPending, this.dbOutletCommandPending);
        return changed;
        
    },
    
    type: 'ApcPduOutletReconciler'  
});
