var res = 0;     if (current.active && !current.system_generated) {      res = 1;     } else if (!current.active && current.system_generated) {      res = 2;     }     current.user_edits = res;
