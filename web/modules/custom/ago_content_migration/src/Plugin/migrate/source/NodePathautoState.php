<?php

namespace Drupal\ago_content_migration\Plugin\migrate\source;

/**
 * @file
 * Contains \Drupal\ago_content_migration\Plugin\migrate\source\PathautoState.
 */

use Drupal\migrate\Plugin\migrate\source\SqlBase;
use Drupal\migrate\Row;

/**
 * Custom migration source for Drupal 8 pathauto_state.
 *
 * @MigrateSource(
 *   id = "node_pathauto_state",
 *   source_module = "node"
 * )
 */
class NodePathautoState extends SqlBase {

  /**
   * {@inheritdoc}
   */
  public function query() {
    $content_types = [
      // 'page',
      // 'press_release',
      // 'ago_faq',
      // 'ago_locations',
      'agoc_courses',
      'ago_blog',
      'ago_publication',
      'agoc_event',
    ];
    $query = $this->select('key_value', 'k');
    $query->fields('k', ['collection', 'name']);
    $query->join('node_field_data', 'nfd', 'k.name = nfd.nid');
    $query->fields('nfd', ['type']);
    $query->condition('k.value', 'i:0;')
      ->condition('nfd.type', $content_types, 'IN')
      ->condition('k.collection', 'pathauto_state.node');
    return $query;
  }

  /**
   * {@inheritdoc}
   */
  public function getIds() {
    $ids['name']['type'] = 'string';
    return $ids;
  }

  /**
   * {@inheritdoc}
   */
  public function fields() {
    $fields['name'] = $this->t('Name');
    $fields['collection'] = $this->t('Collection');
    $fields['type'] = $this->t('Content type');
    return $fields;
  }

  /**
   * {@inheritdoc}
   */
  public function prepareRow(Row $row) {
    // Get the source field from the row.
    $row->setSourceProperty('name', $row->getSourceProperty('name'));
    $row->setSourceProperty('type', $row->getSourceProperty('type'));
    $row->setSourceProperty('entity_type', 'node');
    // Return the result.
    return parent::prepareRow($row);
  }

}
