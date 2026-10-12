if (current.approval == 'approved' || current.approval == 'rejected') {
    current.approval_set = nowDateTime();
    } else {
    current.approval_set.setValue('');
    }
