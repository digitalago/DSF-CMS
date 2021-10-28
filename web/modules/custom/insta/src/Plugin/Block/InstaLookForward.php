<?php

namespace Drupal\insta\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Insta Look Forward' block.
 *
 * @Block(
 *  id = "insta_look_forward",
 *  admin_label = @Translation("Insta Look Forward"),
 * )
 */
class AgoInstaLookForward extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = array();
    $build['#attached'] = array('library' => array('insta/handlebars', 'insta/instashow'));
    $build['#theme'] = 'insta_look_forward';
    $build['#data_source'] = '@ago_toronto ';
    return $build;
  }

}
