var cmu = new ContractManagementUtils();
if (!gs.nil(current.oldStartDate) || !gs.nil(current.oldEndDate)) {
    cmu.appendContractHistory(previous, current.oldStartDate, current.oldEndDate);
} else if (!previous.starts.nil() || !previous.ends.nil() || !previous.terms_and_conditions.nil()) {
    cmu.appendContractHistory(previous);
}
