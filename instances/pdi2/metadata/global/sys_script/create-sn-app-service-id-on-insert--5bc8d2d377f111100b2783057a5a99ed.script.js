(function executeRule(current, previous /*null when async*/ ) {

    var curNum = current.number + '';
    var recordClass = current.getRecordClassName();
    var now_GR = new GlideRecord(recordClass);
    now_GR.addQuery('number', curNum);
    now_GR.setLimit(1);
    now_GR.query();

    if (now_GR.getRowCount() > 0) {
        var newNum = global.getNextObjNumberPadded();
        current.number = newNum;
    }

})(current, previous);
