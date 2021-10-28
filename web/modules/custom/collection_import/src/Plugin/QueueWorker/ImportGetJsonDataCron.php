<?php
/**
 * @file
 * Contains Drupal\collection_import\Plugin\QueueWorker\ImportGetJsonDataCron.php
 */

namespace Drupal\collection_import\Plugin\QueueWorker;

/**
 * Provides Base CURL functionality for the JSON files of portfolio and TMS records on cron.
 *
 * @QueueWorker(
 *   id = "import_get_json_data_cron",
 *   title = @Translation("collection Import Worker: Get JSON data"),
 *   cron = {"time" = 60}
 * )
 */
class ImportGetJsonDataCron extends ImportGetJsonDataBase {}
