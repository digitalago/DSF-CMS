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
 *   id = "taxonomy_pathauto_state",
 *   source_module = "taxonomy"
 * )
 */
class TaxonomyPathautoState extends SqlBase {

  /**
   * {@inheritdoc}
   */
  public function query() {
    $vocab = [
      'agoc_marketing_flag',
      'publication_artists',
      'ago_blog_categories',
      'blog_tags',
      'featured_filters_courses',
      'featured_filters',
      'image_tags',
      'media_category',
      'subject_area',
      'tags',
    ];
    $query = $this->select('key_value', 'k');
    $query->fields('k', ['collection', 'name']);
    $query->join('taxonomy_term_field_data', 'tfd', 'k.name = tfd.tid');
    $query->fields('tfd', ['vid']);
    $query->condition('k.value', 'i:0;')
      ->condition('tfd.vid', $vocab, 'IN')
      ->condition('k.collection', 'pathauto_state.taxonomy_term');
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
    $fields['vid'] = $this->t('Vocabulary');
    return $fields;
  }

  /**
   * {@inheritdoc}
   */
  public function prepareRow(Row $row) {
    // Get the source field from the row.
    $row->setSourceProperty('name', $row->getSourceProperty('name'));
    $row->setSourceProperty('vid', $row->getSourceProperty('vid'));
    $row->setSourceProperty('entity_type', 'taxonomy_term');
    $row->setSourceProperty('path', 'taxonomy/term');

    // Return the result.
    return parent::prepareRow($row);
  }

}
