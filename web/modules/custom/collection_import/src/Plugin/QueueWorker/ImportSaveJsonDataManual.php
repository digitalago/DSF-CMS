<?php
/**
 * @file
 * Contains Drupal\collection_import\Plugin\QueueWorker\ImportSaveJsonDataManual.php
 */

namespace Drupal\collection_import\Plugin\QueueWorker;

/**
 * Provides saving and parsing functionality for the JSON files of portfolio and TMS records manually.
 *
 * @QueueWorker(
 *   id = "import_save_json_data_manual",
 *   title = @Translation("collection Import Worker: Save JSON data manually"),
 * )
 */
class ImportSaveJsonDataManual extends ImportSaveJsonDataBase {}
