<?php

namespace Drupal\insta\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Insta Second' block.
 *
 * @Block(
 *  id = "insta_second_block",
 *  admin_label = @Translation("Insta Second"),
 * )
 */
class InstaSecondBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = array();
    $build['#attached'] = array('library' => array('insta/handlebars', 'insta/instashow'));
    $build['#theme'] = 'toronto_insta';
    $build['#data_source'] = '@ago_toronto';
    return $build;
  }

}
