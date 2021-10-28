<?php
/**
 * @file
 * Contains Drupal\collection_import\Plugin\QueueWorker\ImportGetJsonDataManual.php
 */

namespace Drupal\collection_import\Plugin\QueueWorker;

use Drupal\collection_import\Plugin\QueueWorker\ImportGetJsonDataBase;
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
 * Provides Base CURL functionality for the JSON files of portfolio and TMS records manually.
 *
 * @QueueWorker(
 *   id = "import_get_json_data_manual",
 *   title = @Translation("collection Import Worker: Get JSON data manually"),
 * )
 */
class ImportGetJsonDataManual extends ImportGetJsonDataBase {

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
    $this->queue = $this->queueFactory->get('import_save_json_data_manual', TRUE);

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
}
