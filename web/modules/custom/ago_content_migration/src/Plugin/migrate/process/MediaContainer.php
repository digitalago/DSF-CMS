<?php

namespace Drupal\ago_content_migration\Plugin\migrate\process;

/**
 * @file
 * Contains \Drupal\ago_content_migration\Plugin\migrate\process\MediaContainer.
 */

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;
use Drupal\Core\Database\Database;

/**
 * Process Plugin to migrate media items from Media Container content type.
 *
 * @MigrateProcessPlugin(
 *   id = "media_container",
 *   source_provider = "ago_content_migration"
 * )
 */
class MediaContainer extends ProcessPluginBase {

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    // Load the entity and return reference for media entities.
    if ($value) {
      $db = Database::getConnection('default', 'migrate');
      $query = $db->select('node__field_media_items', 'fmi')
        ->fields('fmi', ['field_media_items_target_id']);
      $query->condition('fmi.entity_id', $value)
        ->condition('fmi.bundle', 'ago_media_container');
      $data = $query->execute()->fetchAssoc();
      $container = [];
      // Check if not empty because some nodes reference deleted entities.
      if (!empty($data)) {
        foreach ($data as $result) {
          $container[] = [
            'target_id' => $result,
          ];
        }
      }
      return $container;
    }

  }

}
