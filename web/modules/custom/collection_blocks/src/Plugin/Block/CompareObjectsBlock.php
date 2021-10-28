<?php

namespace Drupal\collection_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Compare Objects Block' block.
 *
 * @Block(
 *  id = "compare_objects_block",
 *  admin_label = @Translation("Compare Objects Block"),
 * )
 */
class CompareObjectsBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $build['#theme'] = 'compare_objects_block';
    $build['#attached']['library'] = 'collection_blocks/compare_objects';
    return $build;
  }
}
