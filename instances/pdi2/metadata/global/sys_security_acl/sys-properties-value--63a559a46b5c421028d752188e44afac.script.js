if (((current.getValue('name') == 'spm.availability.global.tz') || (current.getValue('name') == 'spm.availability.commitment.tz')) && (gs.getProperty('com.snc.availability.v2') == 'false'))
    answer = false;
else
    answer = true;
