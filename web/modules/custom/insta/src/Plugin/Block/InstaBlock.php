<?php

namespace Drupal\insta\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'AGO Insta' block.
 *
 * @Block(
 *  id = "ago_insta",
 *  admin_label = @Translation("AGO Insta"),
 * )
 */
class InstaBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = array();
    $build['#attached'] = array('library' => array('insta/handlebars', 'insta/instashow'));
    $build['#theme'] = 'ago_insta';
    $build['#data_source'] = '@ago_events';
    return $build;
  }

}
