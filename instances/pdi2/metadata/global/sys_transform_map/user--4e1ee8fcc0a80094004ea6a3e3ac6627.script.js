

// create a user id if neccessary
if (source.user_id.nil())
  target.user_name = source.first_name + "." + source.last_name;
