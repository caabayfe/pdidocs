(function executeRule(current, previous /*null when async*/ ) {

    var utils = new ContactMenuUtils(current);
    utils.insertDefaultContactMenuItems();

})(current, previous);
