<?php

namespace Drupal\collection_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Collection Grid Link Block' block.
 *
 * @Block(
 *  id = "collection_grid_link_block",
 *  admin_label = @Translation("Collection Grid Link Block"),
 * )
 */
class CollectionGridLinkBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $build['#theme'] = 'collection_grid_link_block';
    return $build;
  }
}
