<?php

namespace Drupal\insta\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Insta Art Rental' block.
 *
 * @Block(
 *  id = "insta_art_rental",
 *  admin_label = @Translation("Insta Art Rental"),
 * )
 */
class InstaArtRental extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = array();
    $build['#attached'] = array('library' => array('insta/handlebars', 'insta/instashow'));
    $build['#theme'] = 'insta_art_rental';
    $build['#data_source'] = '@ago_artrental';
    return $build;
  }

}
