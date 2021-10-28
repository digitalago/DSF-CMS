<?php

namespace Drupal\insta\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Insta Shop' block.
 *
 * @Block(
 *  id = "insta_shop",
 *  admin_label = @Translation("Insta Shop"),
 * )
 */
class InstaShop extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = array();
    $build['#attached'] = array('library' => array('insta/handlebars', 'insta/instashow'));
    $build['#theme'] = 'insta_shop';
    $build['#data_source'] = '@agogifts';
    return $build;
  }

}
