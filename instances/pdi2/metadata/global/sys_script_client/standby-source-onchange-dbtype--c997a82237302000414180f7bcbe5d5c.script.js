function onChange(control, oldValue, newValue, isLoading) {
   var source = g_form.getValue("source");
   var primary = g_form.getValue("primary");
   if (primary && primary == 'true')
     return;

   var url = g_form.getValue("database_url");

   if (!shouldPopulate(url))
       return;

   if (newValue == 'mysql')
       g_form.setValue("database_url", "jdbc:mysql://localhost/");
   else if (newValue == 'oracle')
       g_form.setValue("database_url", "jdbc:oracle:thin:@host.com:1521:sidname");
   else if (newValue == 'sqlserver')
       g_form.setValue("database_url", "jdbc:sqlserver://servername:portnum");   
}

function shouldPopulate(url) {
    if (url == "")
        return true;

    if (url == "jdbc:mysql://localhost/" ||
        url == "jdbc:oracle:thin:@host.com:1521:sidname" ||
        url == "jdbc:sqlserver://servername:portnum")
           return true;

    return false;
}
