/**
 * In the event of no WorkerThread record, we'll insert a default one
 * @param {GlideRecord} sGR
 * @returns {String} WorkerThread semaphore record sys_id
 */
function insertNewWorkerSem(sGR) {
  gs.info(
    "No WorkerThread record found. Inserting a default WorkerThread semaphore record..."
  );
  sGR = new GlideRecord("sys_semaphore");
  sGR.initialize();
  sGR.setValue("name", "WorkerThread");
  sGR.setValue("maximum_concurrency", 8);
  sGR.insert();

  gs.print("Inserted a default WorkerThread semaphore record with sysid: " + sGR.getUniqueValue());
  return sGR.getUniqueValue();
}

/**
 * Insert a default semaphore_set record to replace the invalid one
 * Will use the same name, semaphoreSetId as the invalid one
 * Default to 8 max_concurrency
 * Pass in the sys_id of the WorkerThread semaphore record
 * @param {String} name
 * @param {String} semaphoreSetId
 * @param {String} workerThreadSemId
 */
function insertDefaultWorkerThreadSemaphoreSetRecord(
  name,
  semaphoreSetId,
  workerThreadSemId
) {
  var replacementSemaphoreSetGR = new GlideRecord("sys_semaphore_set");
  replacementSemaphoreSetGR.initialize();
  replacementSemaphoreSetGR.setValue("semaphore_set_id", semaphoreSetId);
  replacementSemaphoreSetGR.setValue("name", name);
  replacementSemaphoreSetGR.setValue("max_concurrency", 8);
  replacementSemaphoreSetGR.setValue("semaphore_id", workerThreadSemId);
  replacementSemaphoreSetGR.insert();
  gs.print("Inserted a default WorkerThread semaphore_set record sys_id=" + replacementSemaphoreSetGR.getUniqueValue());
}

/**
 * Checks WorkerThread semaphore records for invalid records
 * if there's only 1 WorkerThread record, regardless of validity,
 * we keep it and use it to update semaphore_set later if needed
 * @returns void
 */
function checkInvalidWorkerThreadRecords() {
  var sGR = new GlideRecord("sys_semaphore");
  if (!sGR.isValid()) {
    gs.info("table not found: sys_semaphore");
    return;
  }
  sGR.addQuery("name", "WorkerThread");
  sGR.query();
  var count = sGR.getRowCount();
  while (sGR.next()) {
		if (count <= 1) {
			// this is the only record
			break;
		}
		var semaphoreSetAggregate = new GlideAggregate("sys_semaphore_set");
		semaphoreSetAggregate.addQuery("semaphore_id", sGR.getUniqueValue());
		if (semaphoreSetAggregate.getCount() == 0) {
			//if found invalid records, delete
			gs.info("Deleting duplicate WorkerThread semaphore sys_id=" + sGR.getUniqueValue());
			// only one left
      sGR.setWorkflow(false);
			sGR.deleteRecord();
			count = count - 1;
		}
	}
}

/**
 * Remove references to invalid semaphore record in semaphore_set table
 * @returns void
 */
function deleteDeadReferences() {
  var ssGR = new GlideRecord("sys_semaphore_set");
  if (!ssGR.isValid()) {
    gs.info("table not found: sys_semaphore_set");
    return;
  }
  ssGR.query();
  // loop through semaphore_set table for invalid references
  while (ssGR.next()) {
    var semaphoreGR = new GlideRecord("sys_semaphore");
    if (!semaphoreGR.get(ssGR.getValue("semaphore_id"))) {
      // remove the invalid records and keep track of the semaphore_set we should add back to
      gs.info("Deleting sys_semaphore_set having broken sys_semaphore reference, sys_id = " + ssGR.getUniqueValue());
      ssGR.setWorkflow(false);
      ssGR.deleteRecord();
    }
  }
}

/**
 * Find the WorkerThread semaphore record, if none exist we'll insert a default one
 * @returns {String} sys_id of the WorkerThread semaphore record
 */
function ensureWorkerThread() {
  var sGR = new GlideRecord("sys_semaphore");
  if (!sGR.isValid()) {
    gs.info("table not found: sys_semaphore");
    return;
  }
  sGR.addQuery("name", "WorkerThread");
  sGR.query();
  // loop through semaphore table for invalid WorkerThread records
  if (sGR.getRowCount() == 0) {
    // no WorkerThread sys_semaphore record, create one
    return insertNewWorkerSem(sGR);
  }
  sGR.next();

  return sGR.getUniqueValue();
}

function checkWorkerThreadReference() {
  // delete invalid records, the semaphore table should have at most 1 WorkerThread record
  // note: it could have 0 WorkerThread record and we handle that in ensureWorkerThread
  checkInvalidWorkerThreadRecords();

  // delete dead references in semaphore_set table
  deleteDeadReferences();

  // Find the WorkerThread semaphore record, returns the sys_id
  var workerThreadSemId = ensureWorkerThread();
  gs.print("Using WorkerThread sys_sempahore record, sys_id=" + workerThreadSemId);

  // get all unique semaphore_set_id
  var ssGR = new GlideAggregate("sys_semaphore_set");
  ssGR.groupBy("semaphore_set_id");
  ssGR.groupBy("name");
  ssGR.query();
  while (ssGR.next()) {
    var semaphoreSetId = ssGR.getValue("semaphore_set_id");
    var semaphoreSetName = ssGR.getValue("name");
    var workerThreadReference = new GlideRecord("sys_semaphore_set");
    workerThreadReference.addQuery("semaphore_id", workerThreadSemId);
    workerThreadReference.addQuery("semaphore_set_id", semaphoreSetId);
    workerThreadReference.query();
    if (!workerThreadReference.next()) {
      gs.info(
        "Found a semaphore set missing WorkerThread semaphore. Inserting a default one..."
      );
      insertDefaultWorkerThreadSemaphoreSetRecord(
        semaphoreSetName,
        semaphoreSetId,
        workerThreadSemId
      );
    }
  }
}

checkWorkerThreadReference();
