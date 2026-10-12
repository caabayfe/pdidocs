var remover = new SNC.PAMigrationDuplicatesRemover('pa_scores');
remover.deleteDuplicates();

remover = new SNC.PAMigrationDuplicatesRemover('pa_snapshots');
remover.deleteDuplicates();
