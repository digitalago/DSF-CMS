<?php

namespace Drupal\collection_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'View List Grid Block' block.
 *
 * @Block(
 *  id = "view_list_grid_block",
 *  admin_label = @Translation("View List Grid Block"),
 * )
 */
class ViewListGridBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $build['#theme'] = 'view_list_grid_block';
    $build['#attached']['library'][] = 'collection_blocks/view_list_grid';
    return $build;
  }
}
