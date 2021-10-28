<?php

namespace Drupal\ago_content_migration\Plugin\migrate\process;

/**
 * @file
 * Contains \Drupal\ago_content_migration\Plugin\migrate\process\UrlAliasMigration.
 */

use Drupal\Core\Database\Database;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;

/**
 * Process Plugin to migrate the D7 url_alias of Nodes.
 *
 * @MigrateProcessPlugin(
 *   id = "url_alias_migration",
 *   source_provider = "ago_content_migration"
 * )
 */
class UrlAliasMigration extends ProcessPluginBase {

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {

    $db = Database::getConnection('default', 'migrate');
    $query = $db->select('path_alias', 'u')
      ->fields('u', ['alias']);

    if ($row->getSourceProperty('entity_type') == 'node') {
      $query = $query->condition('u.path', '/node/' . $value);
    }
    if ($row->getSourceProperty('entity_type') == 'taxonomy_term') {
      $query = $query->condition('u.path', '/taxonomy/term/' . $value);
    }

    $results = $query->execute()->fetch();

    // If the alias can be found, add D8 url_alias.
    if (is_object($results)) {
      return $results->alias;
    }
    // Return null to be skipt.
    return NULL;
  }

}
