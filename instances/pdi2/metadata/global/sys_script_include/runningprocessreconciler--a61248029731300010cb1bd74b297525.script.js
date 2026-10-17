// Discovery

var RunningProcessReconciler = Class.create();
RunningProcessReconciler.prototype = {
    initialize: function(computer, rps, roots, byPID) {
        this.computer = computer;
        this.rps = rps;
        this.byPID = byPID;

        this._load_db_rps();
    },

    /**
     * Reconciles this instance's running processes (in this.rps) against the existing database records.
     * The reconciliation is done by recursing toward the process "leaves" from the process tree roots
     * to ensure that references to parents already have a known parent sys_id.
     */
    reconcile: function() {
        this._reconcileDFS();

        // now update all the records in this.db_rps that have changed...
        var absent_procs = [];
        for (var key in this.db_rps) {
            var staleProcesses = this.db_rps[key];
            staleProcesses.forEach(function(entry) {
                if (entry.absent == 'false') {
                    absent_procs.push(entry.sys_id);
                }
            });
        }

        while (absent_procs.length)
            updateAbsent(absent_procs.splice(0, 100));

        function updateAbsent(toUpdate) {
            var mu = new GlideMultipleUpdate('cmdb_running_process');
            mu.addSetQuery('sys_id', GlideRhinoHelper.getListFromRhino(toUpdate));
            mu.setValue('absent', 'true');
            mu.setValue('sys_updated_on', gs.nowNoTZ());
            mu.execute();

            // event to update related application CI records to absent
            // other applications that rely on running processes may also have a script action defined
            gs.eventQueue("running.process.absent", null, JSON.stringify(toUpdate));
        }
    },

    _reconcileDFS: function() {
        var _this = this;

        _this.rps.forEach(writeProcess);

        function writeProcess(proc) {
            var parent, ds_key, processEntry, existing_rec_sys_id;

            if (proc.sys_id || proc.alreadySeen)
                return;

            // We create synthetic processes that could have circular parent
            // references - it's possible for a process's child to also be
            // its parent.  This flag is used to avoid infinite recursion in
            // this situation.
            proc.alreadySeen = 1;
            parent = _this.byPID[proc.ppid];
            if (parent) {
                // Make sure I've written my parent so I can set the reference
                writeProcess(parent);
                proc.parent = parent.sys_id;
            }

            proc.computer = _this.computer;
            ds_key = proc.command + ':::' + proc.key_parameters;
            processEntry = _this.db_rps[ds_key] && _this.db_rps[ds_key].pop();
            existing_rec_sys_id = processEntry && processEntry.sys_id;
            if (!existing_rec_sys_id)
                proc.sys_id = _this.insert(proc);
            else
                _this.update(existing_rec_sys_id, proc);
        }
    },

    /*
     * Inserts the given running process record, returning the new sys_id.
     */
    insert: function(proc) {
        // set up to insert a new database record...
        var gr = new GlideRecord('cmdb_running_process');
        gr.initialize();

        // copy all the fields from the given discovered data object...
        for (var field in proc)
            if (field.indexOf('_') != 0)
                gr[field] = proc[field];

        // set the computer reference...
        gr.computer = this.computer;
        gr.absent = 'false';

        // insert into the database, then keep track of it internally...
        return '' + gr.insert();
    },

    /*
     * Updates the fields in the given database info object with the fields in the given discovered info object.
     */
    update: function(existing_rec_sys_id, ds_proc) {
        var gr = new GlideRecord('cmdb_running_process');
        if (existing_rec_sys_id)
            gr.get('sys_id', existing_rec_sys_id);

        // copy all the fields from ds_proc to the record
        for (var field in ds_proc)
            if (field.indexOf('_') != 0)
                gr[field] = ds_proc[field];

        // make sure that absent is set to false...
        gr.absent = 'false';

        // set the sys_id for our discovered data...
        ds_proc.sys_id = existing_rec_sys_id;

        gr.update();
    },

    /*
     * Load a map existing running process records. The key for the map is "command:::key_parameters", and
     * the values are maps of record properties. Note that this map includes entries that may be marked as
     * "absent" in the database.
     */
    _load_db_rps: function() {

        var key,
            gr = new GlideRecord('cmdb_running_process');

        this.db_rps = {};

        gr.addQuery('computer', this.computer);
        gr.query();

        while (gr.next()) {
            key = gr.command + ':::' + gr.key_parameters;
            this.db_rps[key] = this.db_rps[key] || [];
            this.db_rps[key].push({
                sys_id: gr.sys_id + '',
                absent: gr.absent + ''
            });
        }
    },

    type: 'RunningProcessReconciler'
};
