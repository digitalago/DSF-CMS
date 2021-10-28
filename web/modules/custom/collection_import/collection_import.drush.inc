<?php
/**
 * @file Contains the code to generate the custom drush commands.
 */

use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\ReliableQueueInterface;
use Drupal\Core\Queue\QueueWorkerInterface;
use Drupal\Core\Queue\QueueWorkerManagerInterface;

/**
 * Implements hook_drush_command().
 */
function collection_import_drush_command() {
 $items = array();
 $items['run-import'] = [
   'description' => 'Runs TMS/Portfolio integration import',
      'arguments' => [
        'domain' => 'The domain of your site',
      ],
      'options' => [
        'objects' => 'Objects file',
        'images' => 'Images file',
        'artists' => 'Artists file',
        'rel_objects' => 'Related Objects file',
      ],
   'drupal dependencies' => ['collection_import'],
   'aliases' => ['cimport'],
 ];
 return $items;
}

/**
 * Callback function for the run-import drush command.
 */
function drush_collection_import_run_import($domain = '') {
  $config = \Drupal::config('collection_import.settings');
  $run_import = $config->get('run_overnight');
  if (!isset($run_import) || !$run_import) {
    drush_log('Import was not scheduled for today', 'success');
    return;
  }
  $vids = array('object_type', 'time_period', 'previous_owner', 'subjects', 'category', 'institution_organization', 'object_name',); // vocabularies
  // cleaning up the queues
  _collection_import_init_queue('import_get_json_data_cron');
  drush_log('Clearing queue import_get_json_data_cron', 'success');
  _collection_import_init_queue('import_get_json_data_manual');
  drush_log('Clearing queue import_get_json_data_manual', 'success');
  _collection_import_init_queue('import_save_json_data_cron');
  drush_log('Clearing queue import_save_json_data_cron', 'success');
  _collection_import_init_queue('import_save_json_data_manual');
  drush_log('Clearing queue import_save_json_data_manual', 'success');

  // populating getter queue
  _collection_import_queue_populate('tms', 'import_get_json_data_manual', $domain);
  drush_log('Populating queue for tms', 'success');
  _collection_import_queue_populate('portfolio_clean', 'import_get_json_data_manual', $domain);
  drush_log('Populating queue for portfolio clearing process', 'success');
  _collection_import_queue_populate('portfolio', 'import_get_json_data_manual', $domain);
  drush_log('Populating queue for portfolio', 'success');
  _collection_import_queue_populate('manifest', 'import_get_json_data_manual', $domain);
  drush_log('Populating queue for manifest', 'success');
  _collection_import_queue_populate('artist_clean', 'import_get_json_data_manual', $domain);
  drush_log('Populating queue for artist clearing process', 'success');
  _collection_import_queue_populate('artist', 'import_get_json_data_manual', $domain);
  drush_log('Populating queue for artist', 'success');
  _collection_import_queue_populate('related_clean', 'import_get_json_data_manual', $domain);
  drush_log('Populating queue for clearing process for related works', 'success');
  _collection_import_queue_populate('related', 'import_get_json_data_manual', $domain);
  drush_log('Populating queue for related works', 'success');

  // processing queues
  // getter queue
  $queueFactory = \Drupal::service('queue');
  $queue = $queueFactory->get('import_get_json_data_manual', TRUE);
  $i = 1;
  while ($item = $queue->claimItem()) {
    _collection_import_queue_process_item('import_get_json_data_manual', $item);
    drush_log('Populating setter queue ' . $i, 'success');
    $i++;
  }
  // setter queue
  $queue = $queueFactory->get('import_save_json_data_manual', TRUE);
  $i = 1;
  while ($item = $queue->claimItem()) {
    _collection_import_queue_process_item('import_save_json_data_manual', $item);
    drush_log('Processing setter queue ' . $i, 'success');
    $i++;
  }
  foreach ($vids as $vid) {
    _collection_import_taxonomy_queue_populate('taxonomy', 'import_get_json_data_manual', $vid, $domain);
  }
  // taxonomy queue
  $queue = $queueFactory->get('import_get_json_data_manual', TRUE);
  $i = 1;
  while ($item = $queue->claimItem()) {
    _collection_import_queue_process_item('import_save_json_data_manual', $item);
    drush_log('Processing setter queue for taxonomies ' . $i, 'success');
    $i++;
  }
  drush_log('The queue has been processed.', 'success');
}


/**
 * Helper function to clear up queue for the import when run on drush.
 *
 * @param str $queue_name
 *    name of the queue.
 */
function _collection_import_init_queue($queue_name) {
  $queueFactory = \Drupal::service('queue');
  $queue = $queueFactory->get($queue_name, TRUE);
  //$queue_worker = \Drupal::service('plugin.manager.queue_worker')->createInstance($queue_name);
  $queue->deleteQueue();
}

/**
 * Helper function to populate the queue.
 *
 * @param str $exportIndicator
 *    inidcates what part of an import is populated.
 *
 * @param str $queue_name
 *    name of the queue.
 */
function _collection_import_queue_populate($exportIndicator, $queue_name, $domain) {
  $queueFactory = \Drupal::service('queue');
  $queue = $queueFactory->get($queue_name, TRUE);
  $item = new \stdClass();
  $data = collection_import_get_file_contents($exportIndicator, $domain);
  $item->content = array('exportIndicator' => $exportIndicator, 'info' => $data);
  $queue->createItem($item);
}

/**
 * Helper function to populate the queue.
 *
 * @param str $exportIndicator
 *    inidcates what part of an import is populated.
 *
 * @param str $queue_name
 *    name of the queue.
 *
 * @param str $vid
 *    taxonomy vocabulary id.
 *
 * @param str $domain
 *    domain string.
 */
function _collection_import_taxonomy_queue_populate($exportIndicator, $queue_name, $vid, $domain) {
  $queueFactory = \Drupal::service('queue');
  $queue = $queueFactory->get($queue_name, TRUE);
  $item = new \stdClass();
  $data = array('vid' => $vid);
  $item->content = array('exportIndicator' => $exportIndicator, 'info' => $data);
  $queue->createItem($item);
}

/**
 * Helper function to process queue item.
 *
 * @param str $queue_name
 *    name of the queue.
 */
function _collection_import_queue_process_item($queue_name, $item) {
  $queueFactory = \Drupal::service('queue');
  $queue = $queueFactory->get($queue_name, TRUE);
  $queue_worker = \Drupal::service('plugin.manager.queue_worker')->createInstance($queue_name);
  if (isset($item)) {
    try {
      $queue_worker->processItem($item->data);
      $queue->deleteItem($item);
    }
    catch (SuspendQueueException $e) {
      $queue->releaseItem($item);
    }
    catch (\Exception $e) {
      watchdog_exception('collection_import', $e);
    }
  }
}

/**
   * Helper function to CURL content of the file.
   *
   * @param str $exportIndicator
   *    String that indicates if we're getting portfolio or TMS data.
   *
   * @return str $data | FALSE
   *    data blob of CURL request.
   */
function collection_import_get_file_contents($exportIndicator = NULL, $domain) {
  $config = \Drupal::config('collection_import.settings');
  $objects_file_name = drush_get_option('objects');
  if (empty($objects_file_name)) {
    $objects_file_name = $config->get('file_name_objects');
  }
  $imgs_file_name = drush_get_option('images');
  if (empty($imgs_file_name)) {
    $imgs_file_name = $config->get('file_name_images');
  }
  $artists_file_name = drush_get_option('artists');
  if (empty($artists_file_name)) {
    $artists_file_name = $config->get('file_name_artists');
  }
  $rel_objs_file_name = drush_get_option('rel_objects');
  if (empty($rel_objs_file_name)) {
    $rel_objs_file_name = $config->get('file_name_rel_objects');
  }
  if (!$exportIndicator) {
    \Drupal::logger('collection_import')->error('exportIndicator is NULL');
    return FALSE;
  }
  elseif ($exportIndicator == 'tms') {
    if (isset($objects_file_name)) {
      $url = $domain . '/sites/default/files/import_data/' . $objects_file_name;
    }
    else {
      $url = $domain . '/sites/default/files/import_data/' . 'Objects.csv';
    }
  }
  elseif ($exportIndicator == 'portfolio_clean') {
    if (isset($imgs_file_name)) {
      $url = $domain . '/sites/default/files/import_data/' . $imgs_file_name;
    }
    else {
      $url = $domain . '/sites/default/files/import_data/' . 'Images.csv';
    }
  }
  elseif ($exportIndicator == 'portfolio') {
    if (isset($imgs_file_name)) {
      $url = $domain . '/sites/default/files/import_data/' . $imgs_file_name;
    }
    else {
      $url = $domain . '/sites/default/files/import_data/' . 'Images.csv';
    }
  }
  elseif ($exportIndicator == 'manifest') {
    if (isset($objects_file_name)) {
      $url = $domain . '/sites/default/files/import_data/' . $objects_file_name;
    }
    else {
      $url = $domain . '/sites/default/files/import_data/' . 'Objects.csv';
    }
  }
  elseif ($exportIndicator == 'artist_clean') {
    if (isset($artists_file_name)) {
      $url = $domain . '/sites/default/files/import_data/' . $artists_file_name;
    }
    else {
      $url = $domain . '/sites/default/files/import_data/' . 'Constituents.csv';
    }
  }
  elseif ($exportIndicator == 'artist') {
    if (isset($artists_file_name)) {
      $url = $domain . '/sites/default/files/import_data/' . $artists_file_name;
    }
    else {
      $url = $domain . '/sites/default/files/import_data/' . 'Constituents.csv';
    }
  }
  elseif ($exportIndicator == 'related_clean') {
    if (isset($rel_objs_file_name)) {
      $url = $domain . '/sites/default/files/import_data/' . $rel_objs_file_name;
    }
    else {
      $url = $domain . '/sites/default/files/import_data/' . 'Relatedworks.csv';
    }

  }
  elseif ($exportIndicator == 'related') {
    if (isset($rel_objs_file_name)) {
      $url = $domain . '/sites/default/files/import_data/' . $rel_objs_file_name;
    }
    else {
      $url = $domain . '/sites/default/files/import_data/' . 'Relatedworks.csv';
    }

  }
  else {
    \Drupal::logger('collection_import')->error('unrecognized exportIndicator');

    return FALSE;
  }
  drush_log($url, 'success');
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); //Set curl to return the data instead of printing it to the browser.
  curl_setopt($ch, CURLOPT_URL, $url);
  $data = curl_exec($ch);
  if(!curl_errno($ch)) {
    $info = curl_getinfo($ch,  CURLINFO_HTTP_CODE);
    if($info!= 200) {
      $data = FALSE;
    }
  }
  else {
    $data = FALSE;
  }
  curl_close($ch);
  return $data;
}
