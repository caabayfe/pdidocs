function redirectToPage() {	
    var sysId = g_form.getUniqueValue();
    var url = '/now/experiment-admin/experiment/' + sysId;

    //open in new tab
    open(url, '_blank');
}
