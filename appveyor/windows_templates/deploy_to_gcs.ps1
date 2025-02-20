$ErrorActionPreference = 'Stop'

$env:PATH += ';C:\grr_deps\google-cloud-sdk\bin'

gcloud auth activate-service-account --key-file C:\grr_src\appveyor\windows_templates\appveyor_uploader_service_account.json

if (!$?) {
  throw 'Failed to activate GCE service account.'
}

Set-Location C:\grr_src

$unix_commit_timestamp = (git show -s --format=%ct $env:APPVEYOR_REPO_COMMIT)
$commit_date_time = [DateTimeOffset]::FromUnixTimeSeconds($unix_commit_timestamp).DateTime

# Create a shorter, more readable time string.
$short_commit_timestamp = $commit_date_time.ToUniversalTime().ToString('yyyy-MM-ddTHH:mmUTC')

$gcs_dest = 'gs://{0}/{1}_{2}/appveyor_build_{3}_job_{4}/' -f @(
    $env:GCS_BUCKET,
    $short_commit_timestamp,
    $env:APPVEYOR_REPO_COMMIT,
    $env:APPVEYOR_BUILD_NUMBER,
    $env:APPVEYOR_JOB_NUMBER)

Write-Output "Uploading templates to $gcs_dest"

$stop_watch = [Diagnostics.Stopwatch]::StartNew()
gsutil cp 'C:\grr_src\output*\*' $gcs_dest
if (!$?) {
  throw 'Failed to upload templates.'
}
$stop_watch.Stop()
$upload_duration = $stop_watch.Elapsed.TotalSeconds

# gsutil will print an info message recommending using the -m option (parallel
# object upload) when copying objects to GCP. For some reason however, that
# doesn't seem to work properly on Appveyor. Some files arbitrarily fail to
# upload with unhelpful error messages like 'Duplicate type [0:0:2]'
Write-Output "Sequential object upload took $upload_duration seconds"
