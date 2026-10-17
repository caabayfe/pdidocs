var newRecordId = SNC.VersionControl.revertTo(current, false);
(new VersionControlUtil).redirect('cert_filter', newRecordId);
