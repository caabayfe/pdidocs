(current.started == 0) ? 'NULL' : ((current.started > 0 && current.started <= current.completed) ? 'Completed ' + current.completed : 'Scan ' + current.completed + ' of ' + current.started)
