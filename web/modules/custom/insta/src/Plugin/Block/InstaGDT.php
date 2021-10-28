<?php

namespace Drupal\insta\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Insta GDT' block.
 *
 * @Block(
 *  id = "insta_gdt",
 *  admin_label = @Translation("Insta GDT"),
 * )
 */
class InstaGDT extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = array();
    $build['#attached'] = array('library' => array('insta/handlebars', 'insta/instashow'));
    $build['#theme'] = 'insta_gdt';
    $build['#data_source'] = '@ago_toronto ';
    return $build;
  }

}
