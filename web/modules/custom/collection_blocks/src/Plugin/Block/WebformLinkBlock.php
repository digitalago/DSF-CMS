<?php

namespace Drupal\collection_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Webform Link Block' block.
 *
 * @Block(
 *  id = "webform_link_block",
 *  admin_label = @Translation("Webform Link Block"),
 * )
 */
class WebformLinkBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];
    $build['#theme'] = 'webform_link_block';
    return $build;
  }
}
