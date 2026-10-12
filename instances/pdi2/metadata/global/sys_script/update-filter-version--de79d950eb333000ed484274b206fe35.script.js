var newRecordId = SNC.VersionControl.createNewVersion(current, false);  // do not move references to latest version
(new VersionControlUtil).redirect('cert_filter', newRecordId);
