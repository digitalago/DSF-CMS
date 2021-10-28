<?php

namespace Drupal\ago_content_migration\Plugin\migrate\source;

/**
 * @file
 * Contains \Drupal\ago_content_migration\Plugin\migrate\source\UserRole.
 */


use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\State\StateInterface;
use Drupal\migrate\Plugin\MigrationInterface;
use Drupal\migrate\Row;
use Drupal\migrate_drupal_d8\Plugin\migrate\source\d8\ContentEntity;

/**
 * Custom user entity migration to bring over the roles.
 *
 * @MigrateSource(
 *   id = "user_role"
 * )
 */
class UserRole extends ContentEntity {

  /**
   * {@inheritdoc}
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, MigrationInterface $migration, StateInterface $state, EntityTypeManagerInterface $entity_type_manager, EntityFieldManagerInterface $entity_field_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $migration, $state, $entity_type_manager, $entity_field_manager);
  }

  /**
   * {@inheritdoc}
   */
  public function prepareRow(Row $row) {
    $uid = $row->getSourceProperty('uid');

    $query = $this->select('user__roles', 'r');
    $query->fields('r', ['roles_target_id']);
    $query->condition('r.entity_id', $uid, '=');
    $record = $query->execute()->fetchAllKeyed();
    $row->setSourceProperty('roles', array_keys($record));

    return parent::prepareRow($row);
  }

}
