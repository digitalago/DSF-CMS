<?php

namespace Drupal\general_search\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'General Search' block.
 *
 * @Block(
 *   id = "general_search_block",
 *   admin_label = @Translation("General Search Trigger Block"),
 * )
 */
class GeneralSearchBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $form = \Drupal::formBuilder()->getForm('Drupal\general_search\Form\GeneralSearchForm');
    return $form;
  }
}
