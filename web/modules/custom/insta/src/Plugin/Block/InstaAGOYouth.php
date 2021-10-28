<?php

namespace Drupal\insta\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Insta AGO Youth' block.
 *
 * @Block(
 *  id = "insta_ago_youth",
 *  admin_label = @Translation("Insta AGO Youth"),
 * )
 */
class InstaAGOYouth extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = array();
    $build['#attached'] = array('library' => array('insta/handlebars', 'insta/instashow'));
    $build['#theme'] = 'insta_ago_youth';
    $build['#data_source'] = '@agoyouth';
    return $build;
  }

}
