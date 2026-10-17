// The last_run_datetime field has the following format 
// "2007-11-08 10:48:38" by default
//
// The filter has the following syntax:
//  SELECT * FROM [tableName] 
//       WHERE [last_run_database_field] >= [last_run_datetime]
//

// if its not quoted already, quote it
if (current.last_run_datetime.indexOf("'") != 0) {
  current.last_run_datetime = "'" + current.last_run_datetime + "'";
}

// the following script truncates the time part, uncomment to use
//
//var s = current.last_run_datetime.toString();
//current.last_run_datetime = s.split(' ')[0] + "'";

// the following script converts our datetime stamp into an oracle date format
// uncomment to use
//
//var s = current.last_run_datetime.toString();
//current.last_run_datetime = "to_date(" + s.split(' ')[0] + "','yyyy-mm-dd')";

// the following script converts our datetime stamp into an SQL server date format
// uncomment to use
//
//var s = current.last_run_datetime.toString();
//current.last_run_datetime = "convert(datetime, " + s + ", 21)";
