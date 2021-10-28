<?php

namespace Drupal\insta\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Insta Bistro' block.
 *
 * @Block(
 *  id = "insta_bistro",
 *  admin_label = @Translation("Insta Bistro"),
 * )
 */
class InstaBistro extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = array();
    $build['#attached'] = array('library' => array('insta/handlebars', 'insta/instashow'));
    $build['#theme'] = 'insta_bistro';
    $build['#data_source'] = '@agobistro';
    return $build;
  }

}
