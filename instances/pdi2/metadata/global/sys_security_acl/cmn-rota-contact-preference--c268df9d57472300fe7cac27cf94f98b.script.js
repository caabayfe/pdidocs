if (current.isNewRecord()) {
	answer = new OnCallSecurityNG().rotaMgrAccess();
}
else {
	answer = new OnCallCommon().hasAccessToContactOverrides(current);
}
