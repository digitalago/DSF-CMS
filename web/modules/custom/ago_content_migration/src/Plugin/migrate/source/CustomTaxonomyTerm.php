<?php

namespace Drupal\ago_content_migration\Plugin\migrate\source;

use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\State\StateInterface;
use Drupal\migrate\Plugin\MigrationInterface;
use Drupal\migrate_drupal_d8\Plugin\migrate\source\d8\TaxonomyTerm;
use Drupal\migrate\Row;

/**
 * Drupal 8 taxonomy_term source from database.
 *
 * @MigrateSource(
 *   id = "custom_taxonomy_term",
 *   source_provider = "ago_content_migration"
 * )
 */
class CustomTaxonomyTerm extends TaxonomyTerm {

  /**
   * The parent value has custom storage, retrieve it directly.
   *
   * @param int $tid
   *   The term id.
   *
   * @return bool|int
   *   The parent term id or FALSE if there is none.
   */
  protected function taxonomyTermGetParent($tid) {
    /** @var \Drupal\Core\Database\Query\SelectInterface $query */
    $query = $this->select('taxonomy_term__parent', 'p')
      ->fields('p', ['parent_target_id'])
      ->condition('entity_id', $tid);
    return $query->execute()->fetchField();
  }

  /**
   * {@inheritdoc}
   */
  public function getIds() {
    $entityDefinition = $this->entityTypeManager->getDefinition($this->configuration['entity_type']);
    $idKey = $entityDefinition->getKey('id');
    $ids[$idKey] = $this->getDefinitionFromEntity($idKey);

    return $ids;
  }

}
