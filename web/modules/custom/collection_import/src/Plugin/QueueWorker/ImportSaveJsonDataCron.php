<?php
/**
 * @file
 * Contains Drupal\collection_import\Plugin\QueueWorker\ImportSaveJsonDataCron.php
 */

namespace Drupal\collection_import\Plugin\QueueWorker;

/**
 * Provides saving and parsing functionality for the JSON files of portfolio and TMS records on cron.
 *
 * @QueueWorker(
 *   id = "import_save_json_data_cron",
 *   title = @Translation("collection Import Worker: Save JSON data on cron"),
 *   cron = {"time" = 30}
 * )
 */
class ImportSaveJsonDataCron extends ImportSaveJsonDataBase {

}
