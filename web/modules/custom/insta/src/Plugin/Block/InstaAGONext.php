<?php

namespace Drupal\insta\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Insta AGO Next' block.
 *
 * @Block(
 *  id = "insta_ago_next",
 *  admin_label = @Translation("Insta AGO Next"),
 * )
 */
class InstaAGONext extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = array();
    $build['#attached'] = array('library' => array('insta/handlebars', 'insta/instashow'));
    $build['#theme'] = 'insta_ago_next';
    $build['#data_source'] = '@agonext';
    return $build;
  }

}
