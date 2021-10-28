<?php
/**
 * @file
 * Contains Drupal\collection_import\Plugin\QueueWorker\ImportGetJsonDataBase.php
 */

namespace Drupal\collection_import\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\ReliableQueueInterface;
use Drupal\Core\Queue\QueueWorkerInterface;
use Drupal\Core\Queue\QueueWorkerManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use \ForceUTF8\Encoding;
use League\Csv\Reader;


/**
 * Provides Base CURL functionality for the JSON files of portfolio and TMS records.
 */
abstract class ImportGetJsonDataBase extends QueueWorkerBase implements ContainerFactoryPluginInterface {
  /**
   * @var QueueFactory
   */
  protected $queueFactory;

  /**
   * @var QueueWorkerManagerInterface
   */
  protected $queueManager;

  /**
   * @var ReliableQueueInterface object
   */
  protected $queue;


  /**
   * {@inheritdoc}
   */
  public function __construct(QueueFactory $queue, QueueWorkerManagerInterface $queue_manager) {
    $this->queueFactory = $queue;
    $this->queueManager = $queue_manager;
    $this->queue = $this->queueFactory->get('import_save_json_data_cron', TRUE);

  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $container->get('queue'),
      $container->get('plugin.manager.queue_worker')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function processItem($data) {
    if (isset($data->content['exportIndicator']) && $data->content['exportIndicator'] == 'tms') {
      $this->parseRecord($data, 'tms');
    }
    elseif (isset($data->content['exportIndicator']) && $data->content['exportIndicator'] == 'portfolio') {
      $this->parseRecord($data, 'portfolio');
    }
    elseif (isset($data->content['exportIndicator']) && $data->content['exportIndicator'] == 'portfolio_clean') {
      $this->parseRecord($data, 'portfolio_clean');
    }
    elseif (isset($data->content['exportIndicator']) && $data->content['exportIndicator'] == 'manifest') {
      $this->createManifestRecord($data);
    }
    elseif (isset($data->content['exportIndicator']) && $data->content['exportIndicator'] == 'artist_clean') {
      $this->parseRecord($data, 'artist_clean');
    }
    elseif (isset($data->content['exportIndicator']) && $data->content['exportIndicator'] == 'artist') {
      $this->parseRecord($data, 'artist');
    }
    elseif (isset($data->content['exportIndicator']) && $data->content['exportIndicator'] == 'related_clean') {
      $this->parseRecord($data, 'related');
    }
    elseif (isset($data->content['exportIndicator']) && $data->content['exportIndicator'] == 'related') {
      $this->parseRecord($data, 'related');
    }
    elseif (isset($data->content['exportIndicator']) && $data->content['exportIndicator'] == 'taxonomy') {
      $this->parseTaxonomyRecord($data);
    }
    else {
      \Drupal::logger('collection_import')->error('unrecognized exportIndicator during queue processing');
    }
  }

  /**
   * Helper function to parse records.
   *
   * @param str $data
   *    JSON data.
   */
  protected function parseRecord($data, $record_key) {
    $csv_blob = $data->content['info'];
    if (!empty($csv_blob) && $csv_blob) {
      $csv_blob = $this->parseCsvData($csv_blob);
      if (isset($csv_blob) && !empty($csv_blob) && is_array($csv_blob)) {
        // creating associative keys
        $keys = array_values($csv_blob[0]);
        foreach ($csv_blob as $index => $row) {
          //skipping 0 index as this is header row.
          if ($index != 0) {
            $item = new \stdClass();
            $item->key = $record_key;
            $info = array();
            $i = 0;
            foreach ($row as $key => $field) {
              if (isset($keys[$i])) {
                $k = $this->cleanText($keys[$i]);
                $info[$k] = $this->cleanText($field);
              }
              $i++;
            }
            if (!empty($info)) {
              $item->info = $info;
              $this->queue->createItem($item);
            }
          }
        }
      }
    }
  }

  /**
   * Helper function to clean incoming data.
   *
   * @param str $text
   *    text that needs to be cleaned up
   *
   * @return str $text
   *    clean verstion of the text
   */
  protected function cleanText($text) {
    //$text = mb_convert_encoding($text , 'UTF-8' , 'UTF-16');
    //$text = Encoding::fixUTF8($text);
    $text = str_replace('\"', 'doublequote', $text);
    $text = str_replace('"', '', $text);
    $text = str_replace('doublequote', '"', $text);
    $text = str_replace("|", "replacetoken", $text);
    $text = str_replace("replacetokenreplacetoken", "\n", $text);
    $text = str_replace("replacetoken", "", $text);
    //$text = str_replace('ÿþ', '', $text);
    $text = trim($text);
    return $text;
  }

  /**
   * Helper function to parse Portfolio JSON Records.
   *
   * @param str $data
   *    JSON data.
   */
  protected function createManifestRecord($data) {
    $csv_blob = $data->content['info'];
    if (!empty($csv_blob) && $csv_blob) {
      $csv_blob = $this->parseCsvData($csv_blob);
      if (isset($csv_blob) && !empty($csv_blob) && is_array($csv_blob)) {
        foreach ($csv_blob as $index => $row) {
          // skipping 0 index as this is header row.
          if ($index !== 0) {
            $item = new \stdClass();
            $item->key = 'manifest';
            // first field is ObjectID in the current setup.
            if (isset($row[1])) {
              $info['ObjectID'] = $this->cleanText($row[1]);
              //drush_log($info['ObjectID'], 'success');
            }
            if (!empty($info) && isset($info['ObjectID'])) {
              $item->info = $info;
              $this->queue->createItem($item);
            }
          }
        }
      }
    }
  }

  protected function parseTaxonomyRecord($data) {
    $item = new \stdClass();
    $item->key = 'taxonomy';
    $item->info = $data->content['info'];
    $this->queue->createItem($item);
  }

  /**
   * Helper function to parse CSV string into array
   *
   * @param str $data
   *    string data from the CSV.
   *
   * @return array $parsed_data
   *    array of parsed data.
   */
  protected function parseCsvData($data) {
    $parsed_data = array();
    if(isset($data)) {
      $csv = Reader::createFromString($data);
      $csv->setDelimiter("\t");
      $csv->setEnclosure('"');
      //$csv->setEscape('*');
      $parsed_data = $csv->fetchAll();
    }
    return $parsed_data;
  }

}
