// Discovery
gs.include("PrototypeServer");

/**
 * Implements the common logic and helper methods for reconciling related lists for a particular CMDB item against 
 * discovered information present in a MemoryTable instance. Most of this logic is very straightforward, but one bit
 * may not be: the resolution of references to previously reconciled records. This feature works by collecting 
 * information while reconciling one related list, then passing that information on to the reconciler for another 
 * related list. For example, while switch partitions are being reconciled, information is gathered (in a Map instance) 
 * that maps an interface number for a partition to the sys_id of the partition's record in the partition table. Then 
 * later when the switchports are being reconciled, a reference to the switch partition that contains the switchport 
 * can be resolved by using this Map.
 * 
 * author Tom Dilatush  tom.dilatush@service-now.com
 */
var AbstractReconciler = Class.create();

AbstractReconciler.prototype = {
    /**
     * Creates a new instance of this class for the given related list, parent field name, CMDB item, and newly 
     * discovered data.
     * 
     * tableName 
     *     The table name of the related list we are reconciling to.
     * parentFieldName 
     *     The field name for the reference to the parent record.
     * cmdbSysID 
     *     The sys_id for the CMDB item that owns our related list.
     * discovered 
     *     The MemoryTable containing our newly discovered information.
     */
    _initialize: function(tableName, parentFieldName, cmdbSysID, discovered) {
        this.database = new GlideRecord(tableName); // GlideRecord: the related list being reconciled...
        this.discovered = discovered;               // MemoryTable: the data just discovered...
        this.rediscovered = null;                   // Set: tracks those items that have been rediscovered (so we can 
                                                    //      figure out which discovered items are new)...
        this.cmdbSysID = cmdbSysID;                 // String: the sys_id of the CMDB item we're related to...
        this.parentFieldName = parentFieldName;     // String: the name of the field containing a reference to the 
                                                    //         parent...
        this.database.addQuery(this.parentFieldName, this.cmdbSysID);
        this.database.query();
    },

    /**
     * Reconciles the newly discovered data with the data already present in the database. Resolves references
     * to previously reconciled data.
     */
    process: function() {
        // some setup...
        this.rediscovered = new Packages.java.util.HashSet();
        var rField = this.getReconcilationField();
        if (!this.discovered.index(rField))
            gs.log('WARNING: At least one duplicate key in reconcilation: ' + this.type);
        this.setup();

        // walk through each record we already have in the database...
        while (this.database.next()) {
            // read in what's currently in the database for this record...
            this.readDatabaseFields();

            // does the same item exist in the newly discovered data?
            var rKey = this.getReconcilationKey();
            if (this.discovered.indexMoveTo(rKey)) {
                // yes, we found the same item, so read the data we discovered and see if it's valid...
                if (!this.readDiscovered())
                    continue;

                // we got valid data, so resolve any reference fields, mark it as rediscovered, and track it...
                this.resolveReferenceFields();
                this.rediscovered.add('' + rKey);
                this.track(this.database.getValue('sys_id'));

                // if the data we discovered is different than what we already knew, update the database...
                if (this.hasChanged()) {
                    this.setDatabaseFields();
                    this.markPresent();
                    this.database.update();
                }
            } else { // the item in the database isn't in the discovered data, so mark the database record as absent...
                this.markAbsent();
                this.database.update();
            }
        }

        // iterate through any discovered records that were not marked as rediscovered...
        var it = this.discovered.iteratorRemaining(this.rediscovered);
        while (it.hasNext()) {
            // read the data from the discovered record, and see if it was valid...
            it.next();
            if (!this.readDiscovered())
                continue;

            // we got valid data, so resolve any reference fields...
            this.resolveReferenceFields();

            // insert a new record in the database for this item and track it...
            this.database.initialize();
            this.setDatabaseFields();
            this.database.setValue(this.parentFieldName, this.cmdbSysID);
            this.markPresent();
            this.track(this.database.insert());
        }
    },

    /**
     * Optional method, overridden in concrete subclasses that need special setup.
     */
    setup: function() {},

    /**
     * Optional method, overridden in concrete subclasses that need to track reference resolution information for the
     * current updated or inserted database record. Typically this method adds a map entry relating some discoverable
     * information to the sys_id of the current database record, but this behavior is not mandatory.
     * 
     * sysID 
     *     The sys_id of the current database record.
     */
    track: function(sysID) {},

    /**
     * Optional method, overridden in concrete subclasses that need to resolve reference fields. This method is invoked
     * after valid discovered data is read. Generally implementations will use some of this discovered data as a key
     * into a map (passed into the concrete reconciler class when it was instantiated) that will return the sys_id of
     * the database record holding the referenced information. However, implementations are not required to use this
     * approach.
     */
    resolveReferenceFields: function() {},

    /**
     * Read the fields in the current database record into instance member fields.
     * Mandatory method, must be overridden in all concrete subclasses.
     */
    readDatabaseFields: function() {},

    /**
     * Read the current memory table record of newly discovered data and check its validity.
     * Mandatory method, must be overridden in all concrete subclasses.
     * 
     * return 
     *     A boolean, true if the data read is valid.
     */
    readDiscovered: function() {},

    /**
     * Returns the name of the column in the memory table of discovered data that will be used as the key to find
     * rediscovered records. The memory table will be indexed on this column.
     * Mandatory method, must be overridden in all concrete subclasses.
     * 
     * return 
     *     The column name.
     */
    getReconcilationKey: function() {},

    /**
     * Returns the string value of the field to be used as a key to look up a record in the newly discovered data. This
     * value will be used to attempt to find a record in the discovered data, using the column returned by the 
     * getReconciliationKey() method.
     * Mandatory method, must be overridden in all concrete subclasses.
     * 
     * return 
     *     The String value to use as a key into the discovered data.
     */
    getReconcilationField: function() {},

    /**
     * Returns true if the newly discovered data is different than the data already in the database for this item. This
     * method is only invoked for items that have been rediscovered.
     * Mandatory method, must be overridden in all concrete subclasses.
     * 
     * return 
     *     A boolean, true if the data has changed.
     */
    hasChanged: function() {},

    /**
     * Sets the database fields for the current record to the valuees in the newly discovered information. This method
     * is invoked both for new database records and for existing database records when the discovered data has changed.
     * Mandatory method, must be overridden in all concrete subclasses.
     */
    setDatabaseFields: function() {},

    /**
     * CIs are marked as absent by setting the install status to "Absent"; other tables are marked by setting the 
     * (presumed present) field "absent" to true.
     */
    markAbsent: function() {
        if (this.isCI())
            this.database.setValue('install_status', 100);  // set to "Absent"...
        else
            this.database.setValue('absent', true);
    },

    /**
     * CIs are marked as present by setting the install status to "Installed"; other tables are marked by setting the 
     * (presumed present) field "absent" to false.
     */
    markPresent: function() {
        if (this.isCI())
            this.database.setValue('install_status', 1);  // set to "Installed"...
        else
            this.database.setValue('absent', false);
    },

    isCI: function() {
        var base = '' + GlideDBObjectManager.get().getAbsoluteBase0(this.database.getTableName());
        return 'cmdb_ci' == base;
    },

//===============================================================================================================
// The following methods are all helper methods; their main purpose is to provide simpler, cleaner syntax in the
// concrete subclasses.
//===============================================================================================================
    areEqual: function(a, b) {
        if ((a instanceof Object) || (b instanceof Object))
            return GlideObjectUtil.areEqual(a, b);
        else
            return a == b;
    },
    
    areNotEqual: function(a, b) {
        return !this.areEqual(a, b);
    },

    getDsMAC: function(fieldName) {
        return SncMACAddress.getMACAddressInstance(this.discovered.getValue(fieldName));
    },

    getDsIP: function(fieldName) {
        return SncIPAddressV4.getIPAddressV4Instance(this.discovered.getValue(
                fieldName));
    },

    getDsNetmask: function(fieldName) {
        return SncIPNetmaskV4.getIPNetmaskV4Instance(this.discovered.getValue(
                fieldName));
    },

    getDsNetwork: function(fieldName) {
        return SncIPNetworkV4.getIPNetworkInstance(this.discovered.getValue(fieldName));
    },

    getDsBoolean: function(fieldName) {
        return 'true' == this.discovered.getValue(fieldName);
    },

    getDsInt: function(fieldName) {
        return this.discovered.getValueInt(fieldName);
    },

    getDsFloat: function(fieldName) {
        return this.discovered.getValueDouble(fieldName);
    },

    getDsString: function(fieldName) {
        return this.discovered.getValue(fieldName);
    },

    getMAC: function(fieldName) {
        return SncMACAddress.getMACAddressInstance(this.database.getValue(fieldName));
    },

    getIP: function(fieldName) {
        return SncIPAddressV4.getIPAddressV4Instance(this.database.getValue(fieldName));
    },

    getNetmask: function(fieldName) {
        return SncIPNetmaskV4.getIPNetmaskV4Instance(this.database.getValue(fieldName));
    },

    getNetwork: function(fieldName) {
        return SncIPNetworkV4.getIPNetworkInstance(this.database.getValue(fieldName));
    },

    getBoolean: function(fieldName) {
        return true && this.database.getValue(fieldName);
    },

    getInt: function(fieldName) {
        return this.database.getValue(fieldName) - 0;
    },

    getFloat: function(fieldName) {
        return this.database.getValue(fieldName) - 0.0;
    },

    getString: function(fieldName) {
        return this.database.getValue(fieldName);
    },

    set: function(fieldName, value) {
        var val = (value == null) ? '' : value;
        if (val instanceof Object)
            val = val.toString();
        this.database.setValue(fieldName, val);
    },

    type: 'AbstractReconciler'
};
