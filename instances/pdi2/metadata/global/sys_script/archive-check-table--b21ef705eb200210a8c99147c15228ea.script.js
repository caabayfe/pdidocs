(function executeRule(current, previous /*null when async*/ ) {
        var tableName = current.table;
        var canArchive = true;

        if (tableName.startsWith('ar_') || tableName.startsWith('ts_')) { //exclude archive table and text search table
            canArchive = false;
        } else {
            var td = GlideTableDescriptor.get(tableName);
            if (td.getED().getBooleanAttribute('no_archive')) //exclude table with no_archive=true
                canArchive = false;
        }

        if (!canArchive) {
            gs.addErrorMessage(gs.getMessage("Invalid 'Table' selected. Can not create an archive rule for table '{0}'.", [current.table]));
            current.setAbortAction(true);
        }
    }
)(current, previous);
