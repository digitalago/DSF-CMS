<?php

namespace Drupal\ago_content_migration\Plugin\migrate\process;

/**
 * @file
 * Contains \Drupal\ago_content_migration\Plugin\migrate\process\PathautoStateMigration.
 */

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\migrate\Plugin\MigrationInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\migrate\Row;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\pathauto\PathautoState;

/**
 * Process Plugin to migrate pathauto_state of Nodes.
 *
 * @MigrateProcessPlugin(
 *   id = "pathauto_state_migration",
 *   source_provider = "ago_content_migration"
 * )
 */
class PathautoStateMigration extends ProcessPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\migrate\Plugin\MigratePluginManager
   */
  protected $entityTypeManager;

  /**
   * The migration to be executed.
   *
   * @var \Drupal\migrate\Plugin\MigrationInterface
   */
  protected $migration;

  /**
   * {@inheritdoc}
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, MigrationInterface $migration, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->migration = $migration;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition, MigrationInterface $migration = NULL) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $migration,
      $container->get('entity_type.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    // Load the entity and update pathauto settings.
    $entity_type = $row->getSourceProperty('entity_type');
    $entity = $this->entityTypeManager->getStorage($entity_type)->load($value);
    $entity->set("path", ["pathauto" => PathautoState::SKIP]);
    $entity->save();
    return $value;

  }

}
