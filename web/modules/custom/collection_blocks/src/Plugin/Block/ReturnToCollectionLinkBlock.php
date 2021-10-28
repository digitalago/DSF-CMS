<?php

namespace Drupal\collection_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Return to Collection Link Block' block.
 *
 * @Block(
 *  id = "return_to_collection_link_block",
 *  admin_label = @Translation("Return to Collection Link Block"),
 * )
 */
class ReturnToCollectionLinkBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $build['#theme'] = 'return_to_collection_link_block';
    return $build;
  }
}
