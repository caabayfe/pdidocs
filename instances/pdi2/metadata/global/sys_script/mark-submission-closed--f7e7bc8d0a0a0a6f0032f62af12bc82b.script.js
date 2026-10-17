if (current.status == 'closed_created' || current.status == 'closed_duplicate' || current.status == 'closed_invalid')
    current.active = false;
else
    current.active = true;
