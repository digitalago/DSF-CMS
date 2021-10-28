<?php

namespace Drupal\collection_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Zoom Tool Block' block.
 *
 * @Block(
 *  id = "zoom_tool_block",
 *  admin_label = @Translation("Zoom Tool Block"),
 * )
 */
class ZoomToolBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $build['#theme'] = 'zoom_tool_block';
    return $build;
  }
}
