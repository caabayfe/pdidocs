(function executeRule(current, previous /*null when async*/ ) {

    var empJobPositionUtil = new sn_employee.EP_EmployeeJobPositionUtil();
    var hasDuplicates = empJobPositionUtil.checkForDuplicates(current);
    if (hasDuplicates) {
        // Found duplicate with same employee_profile, business_title, primary, location, etc.
        gs.warn('Duplicate employee position detected');
        gs.addErrorMessage(gs.getMessage('Duplicate employee position already exists'));
        current.setAbortAction(true);
    }

})(current, previous);
