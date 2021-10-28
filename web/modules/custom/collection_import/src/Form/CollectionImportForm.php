<?php
/**
 * @file
 * Contains \Drupal\collection_import\Form\collectionImportForm.
 */

namespace Drupal\collection_import\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\ReliableQueueInterface;
use Drupal\Core\Queue\QueueWorkerInterface;
use Drupal\Core\Queue\QueueWorkerManagerInterface;
use Drupal\Core\Queue\SuspendQueueException;
use Symfony\Component\DependencyInjection\ContainerInterface;
use phpseclib\Net\SFTP;


class CollectionImportForm extends ConfigFormBase {

  /**
   * @var QueueFactory
   */
  protected $queueFactory;

  /**
   * @var QueueWorkerManagerInterface
   */
  protected $queueManager;

  public static $queueManagerInstance;

  /**
   * {@inheritdoc}
   */
  public function __construct(QueueFactory $queue, QueueWorkerManagerInterface $queue_manager) {
    $this->queueFactory = $queue;
    $this->queueManager = $queue_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('queue'),
      $container->get('plugin.manager.queue_worker')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['collection_import.settings',];
  }

  /**
   * {@inheritdoc}.
   */
  public function getFormId() {
    return 'collection_import_form';
  }

  /**
   * {@inheritdoc}.
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('collection_import.settings');
    $form['help'] = array(
      '#type' => 'markup',
      '#markup' => $this->t('Submitting this form will either result in scheduling the import for the next cron run or trigger a manual import. Please choose the desired action below. You can also just update the settings'),
    );
    $form['help_config'] = array(
      '#type' => 'markup',
      '#markup' => $this->t('Please configure import settings. Changes will affect next import.'),
    );
    $form['loris_url'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('URL to the Loris server'),
      '#description' => $this->t('Please include trailing slash'),
      '#default_value' => ($config->get('loris_url')) ? $config->get('loris_url') : '',
      '#size' => 60,
      '#maxlength' => 512,
      '#required' => TRUE,
    );
    $form['file_name_objects'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Name of the objects import file'),
      '#default_value' => ($config->get('file_name_objects')) ? $config->get('file_name_objects') : '',
      '#size' => 60,
      '#maxlength' => 512,
      '#description' => $this->t('Case sensetive; the file name is prefixed with /sites/default/files/import_data/ automatically during the import. Default value is Objects.csv if the field is left blank' ),
    );
    $form['file_name_images'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Name of the images import file'),
      '#default_value' => ($config->get('file_name_images')) ? $config->get('file_name_images') : '',
      '#size' => 60,
      '#maxlength' => 512,
      '#description' => $this->t('Case sensetive; the file name is prefixed with /sites/default/files/import_data/ automatically during the import. Default value is Images.csv if the field is left blank'),
    );
    $form['file_name_artists'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Name of the artists import file'),
      '#default_value' => ($config->get('file_name_artists')) ? $config->get('file_name_artists') : '',
      '#size' => 60,
      '#maxlength' => 512,
      '#description' => $this->t('Case sensetive; the file name is prefixed with /sites/default/files/import_data/ automatically during the import. Default value is Constituents.csv if the field is left blank'),
    );
    $form['file_name_rel_objects'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Name of the related objects import file'),
      '#default_value' => ($config->get('file_name_rel_objects')) ? $config->get('file_name_rel_objects') : '',
      '#size' => 60,
      '#maxlength' => 512,
      '#description' => $this->t('Case sensetive; the file name is prefixed with /sites/default/files/import_data/ automatically during the import. Default value is Relatedworks.csv if the field is left blank'),
    );
    $form['thumbnail_collection'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Width for the object thumbnails on the collection page'),
      '#description' => $this->t('Width is in px. Please provide just a number e. g. 250'),
      '#default_value' => ($config->get('thumbnail_collection')) ? $config->get('thumbnail_collection') : '',
      '#size' => 60,
      '#maxlength' => 60,
    );
    $form['thumbnail_object'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Width for the object thumbnails on the object page'),
      '#description' => $this->t('Width is in px. Please provide just a number e. g. 80'),
      '#default_value' => ($config->get('thumbnail_collection')) ? $config->get('thumbnail_object') : '',
      '#size' => 60,
      '#maxlength' => 60,
    );
    $form['main_img_object'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Width for the object main image on the object page'),
      '#description' => $this->t('Width is in px. Please provide just a number e. g. 680'),
      '#default_value' => ($config->get('thumbnail_collection')) ? $config->get('main_img_object') : '',
      '#size' => 60,
      '#maxlength' => 60,
    );
    $form['run_overnight'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Run import over night?'),
      '#default_value' => ($config->get('run_overnight')) ? $config->get('run_overnight') : FALSE,
    );
    $form['actions']['#type'] = 'actions';
    $form['actions']['schedule_import'] = array(
      '#type' => 'submit',
      '#value' => $this->t('Schedule Import'),
      '#button_type' => 'primary',
    );
     $form['actions']['run_import'] = array(
      '#type' => 'submit',
      '#value' => $this->t('Trigger Import'),
      '#button_type' => 'primary',
    );

    //return $form;
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // saving config
    $this->config('collection_import.settings')
      ->set('loris_url', $form_state->getValue('loris_url'))
      ->set('thumbnail_object', $form_state->getValue('thumbnail_object'))
      ->set('thumbnail_collection', $form_state->getValue('thumbnail_collection'))
      ->set('main_img_object', $form_state->getValue('main_img_object'))
      ->set('run_overnight', $form_state->getValue('run_overnight'))
      ->set('file_name_objects', $form_state->getValue('file_name_objects'))
      ->set('file_name_images', $form_state->getValue('file_name_images'))
      ->set('file_name_artists', $form_state->getValue('file_name_artists'))
      ->set('file_name_rel_objects', $form_state->getValue('file_name_rel_objects'))
      ->save();

    $operation = $form_state->getValues()['op']->__toString();
    if (isset($operation) && $operation === 'Schedule Import') {
      // schedule import to run on cron
      // populating data queue
      $this->jsonDataQueuePopulate();
    }
    elseif (isset($operation) && $operation === 'Trigger Import') {
      // trigger manual import
      $this->jsonDataQueuePopulate(TRUE);
    }
    parent::submitForm($form, $form_state);
  }

  /**
   * Helper function to populate Queue with JSON data from files.
   *
   * @param boolean $isManual
   *    Flag to indicate if we should populate manual or cron queue.
   */
  protected function jsonDataQueuePopulate($isManual = FALSE) {
    $queue = $this->queueFactory->get('import_get_json_data_cron', TRUE);
    $queue->deleteQueue();
    // get manual queue instance
    $queue_manual = $this->queueFactory->get('import_get_json_data_manual');
    $queue_manual->deleteQueue();
    // get save queue
    $queue_save = $this->queueFactory->get('import_save_json_data_cron', TRUE);
    $queue_save->deleteQueue();
    // get manual save queue insatnce
    $queue_save_manual = $this->queueFactory->get('import_save_json_data_manual', TRUE);
    $queue_save_manual->deleteQueue();
    $vids = array('object_type', 'time_period', 'previous_owner', 'subjects', 'category', 'institution_organization', 'object_name',); // vocabularies
    if ($isManual) {
      $operations = array();
      // making a queue of the files.
      $operations[] = array('\Drupal\collection_import\Form\collectionImportForm::getBatchOperation', array('queueCreateItem', array('tms', $queue_manual,)));
      $operations[] = array('\Drupal\collection_import\Form\collectionImportForm::getBatchOperation', array('queueCreateItem', array('portfolio_clean', $queue_manual,)));
      $operations[] = array('\Drupal\collection_import\Form\collectionImportForm::getBatchOperation', array('queueCreateItem', array('portfolio', $queue_manual,)));
      $operations[] = array('\Drupal\collection_import\Form\collectionImportForm::getBatchOperation', array('queueCreateItem', array('manifest', $queue_manual,)));
      $operations[] = array('\Drupal\collection_import\Form\collectionImportForm::getBatchOperation', array('queueCreateItem', array('artist_clean', $queue_manual,)));
      $operations[] = array('\Drupal\collection_import\Form\collectionImportForm::getBatchOperation', array('queueCreateItem', array('artist', $queue_manual,)));
      $operations[] = array('\Drupal\collection_import\Form\collectionImportForm::getBatchOperation', array('queueCreateItem', array('related_clean', $queue_manual,)));
      $operations[] = array('\Drupal\collection_import\Form\collectionImportForm::getBatchOperation', array('queueCreateItem', array('related', $queue_manual,)));
      // getting data.
      $operations[] = array('\Drupal\collection_import\Form\collectionImportForm::queueProcessItem', array($queue_manual, 'import_get_json_data_manual'));
      $operations[] = array('\Drupal\collection_import\Form\collectionImportForm::queueProcessItem', array($queue_save_manual, 'import_save_json_data_manual'));
      // making queue of taxonomies to clear
      foreach ($vids as $vid) {
        $operations[] = array('\Drupal\collection_import\Form\collectionImportForm::getBatchOperation', array('queueCreateTaxonomyItem', array('taxonomy', $vid, $queue_manual,)));
      }
      $batch = array(
        'title' => $this->t('Objects Import'),
        'operations' => $operations,
        'label' => $this->t('Object Import'),
        'finished' => NULL,
      );
      batch_set($batch);

    }
    else {
      self::queueCreateItem('tms', $queue);
      self::queueCreateItem('portfolio_clean', $queue);
      self::queueCreateItem('portfolio', $queue);
      // creating an empty manifest placeholder queue item.
      self::queueCreateItem('manifest', $queue);
      // creating queue item for artists.
      self::queueCreateItem('artist_clean', $queue);
      self::queueCreateItem('artist', $queue);
      // creating queue item for related objects.
      self::queueCreateItem('related_clean', $queue);
      self::queueCreateItem('related', $queue);
    }
  }

  /**
   * Helper function to get batch operation.
   *
   * @param $callback_name.
   *    name of the callback function that needs to be called.
   *
   * @param array $arguments.
   *    array of arguments that needs to be passed to the callback function.
   */
  public static function getBatchOperation($callback_name, $arguments, &$context) {
    switch ($callback_name) {
      case 'queueCreateItem':
        self::$callback_name($arguments[0], $arguments[1]);
      break;
      case 'queueProcessItem':
        self::$callback_name($arguments[0], $arguments[1], $context);
      break;
      case 'queueCreateTaxonomyItem':
        self::$callback_name($arguments[0], $arguments[1], $arguments[2]);
      break;
    }

  }

  /**
   * Helper function to manually process queued items.
   *
   * @param QueueFactory $queue
   *
   * @param str $queue_name
   *    name of the queue.
   */
  public static function queueProcessItem($queue, $queue_name, &$context) {
    $queue_worker = \Drupal::service('plugin.manager.queue_worker')->createInstance($queue_name);
    $limit = 1;
    if (empty($context['sandbox'])) {
      $context['sandbox']['progress'] = 0;
      $context['sandbox']['current'] = 0;
      $context['sandbox']['max'] = $queue->numberOfItems();
      $context['sandbox']['offset'] = 0;
    }
    else {
      $context['sandbox']['offset'] = $context['sandbox']['offset'] + $limit +1;
    }
    $off = min($context['sandbox']['offset'] + $limit, $context['sandbox']['max']-1);
    for ($i = $context['sandbox']['offset']; $i <= $off; $i++) {
      $item = $queue->claimItem();
      if (isset($item)) {
        try {
          $queue_worker->processItem($item->data);
          $queue->deleteItem($item);
        }
        catch (SuspendQueueException $e) {
          $queue->releaseItem($item);
          break;
        }
        catch (\Exception $e) {
          watchdog_exception('collection_import', $e);
        }
      }
      $context['sandbox']['progress']++;
    }
    if ($context['sandbox']['progress'] != $context['sandbox']['max']) {
      $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
    }
    else {
      $context['sandbox'] = array();
      $context['finished'] = 1;
    }
  }

  /**
   * Helper function to create queue item.
   *
   * @param str $exportIndicator
   *     String that indicates if we're getting portfolio or TMS data.
   *
   * @param queue
   *    QueueInterface object.
   */
  protected static function queueCreateItem($exportIndicator, $queue) {
    $item = new \stdClass();
    $data = self::getFileContents($exportIndicator);
    $item->content = array('exportIndicator' => $exportIndicator, 'info' => $data);
    $queue->createItem($item);
  }

  /**
   * Helper function to create queue item.
   *
   * @param str $exportIndicator
   *    String that indicates if we're getting portfolio or TMS data.
   *
   * @param str $vid
   *    Taxonomy vocabulary id.
   *
   * @param queue
   *    QueueInterface object.
   */
  protected static function queueCreateTaxonomyItem($exportIndicator, $vid, $queue) {
    $item = new \stdClass();
    $data = array('vid' => $vid);
    $item->content = array('exportIndicator' => $exportIndicator, 'info' => $data);
    $queue->createItem($item);
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
 protected static function getFileContents($exportIndicator = NULL) {
    $config = \Drupal::config('collection_import.settings');
    $objects_file_name = $config->get('file_name_objects');
    $imgs_file_name = $config->get('file_name_images');
    $artists_file_name = $config->get('file_name_artists');
    $rel_objs_file_name = $config->get('file_name_rel_objects');
    //self::testSftp();
    if (!$exportIndicator) {
      \Drupal::logger('collection_import')->error('exportIndicator is NULL');
      return FALSE;
    }
    elseif ($exportIndicator == 'tms') {
      if (!empty($objects_file_name)) {
        $uri = 'public://import_data/' . $objects_file_name;
      }
      else {
        $uri = 'public://import_data/' . 'Objects.csv';
      }
    }
    elseif ($exportIndicator == 'portfolio_clean') {
      if (!empty($imgs_file_name)) {
        $uri = 'public://import_data/' . $imgs_file_name;
      }
      else {
        $uri = 'public://import_data/' . 'Images.csv';
      }
    }
    elseif ($exportIndicator == 'portfolio') {
      if (!empty($imgs_file_name)) {
        $uri = 'public://import_data/' . $imgs_file_name;
      }
      else {
        $uri = 'public://import_data/' . 'Images.csv';
      }
    }
    elseif ($exportIndicator == 'manifest') {
      if (!empty($objects_file_name)) {
        $uri = 'public://import_data/' . $objects_file_name;
      }
      else {
        $uri = 'public://import_data/' . 'Objects.csv';
      }
    }
    elseif ($exportIndicator == 'artist') {
      if (!empty($artists_file_name)) {
        $uri = 'public://import_data/' . $artists_file_name;
      }
      else {
        $uri = 'public://import_data/' . 'Constituents.csv';
      }
    }
    elseif ($exportIndicator == 'artist_clean') {
      if (!empty($artists_file_name)) {
        $uri = 'public://import_data/' . $artists_file_name;
      }
      else {
        $uri = 'public://import_data/' . 'Constituents.csv';
      }
    }
    elseif ($exportIndicator == 'related_clean') {
      if (!empty($rel_objs_file_name)) {
        $uri = 'public://import_data/' . $rel_objs_file_name;
      }
      else {
        $uri = 'public://import_data/' . 'Relatedworks.csv';
      }

    }
    elseif ($exportIndicator == 'related') {
      if (!empty($rel_objs_file_name)) {
        $uri = 'public://import_data/' . $rel_objs_file_name;
      }
      else {
        $uri = 'public://import_data/' . 'Relatedworks.csv';
      }

    }
    else {
      \Drupal::logger('collection_import')->error('unrecognized exportIndicator');
      return FALSE;
    }
    $url = file_create_url($uri);
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


  protected static function testSftp() {
    $sftp = new SFTP('74.213.172.182', '2221');
    if (!$sftp->login('echidna', 'Ech!dn@f1le$')) {
      drupal_set_message(t('SFTP login failed. Import can\'t be scheduled.'), 'error', FALSE);
    }
    else {
      $sftp->chdir('Echidna/RECORDS');
      $sftp->get('TMS_CONSTITUENTS_20160819.csv', 'public://TMS_CONSTITUENTS_20160819.csv');
      drupal_set_message(t('Import was scheduled successfully'), 'status', FALSE);
    }
  }
}
