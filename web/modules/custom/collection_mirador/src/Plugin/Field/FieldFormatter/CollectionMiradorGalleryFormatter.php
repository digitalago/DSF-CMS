<?php
/**
 * @file
 * Contains \Drupal\collection_mirador\Plugin\Field\FieldFormatter\collectionMiradorGalleryFormatter.
 */

namespace Drupal\collection_mirador\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Plugin implementation of the 'collection_mirador_thumb' formatter.
 *
 * @FieldFormatter(
 *   id = "collection_mirador_gallery",
 *   label = @Translation("Collection Mirador Gallery"),
 *   field_types = {
 *     "string"
 *   }
 * )
 */
class CollectionMiradorGalleryFormatter extends FormatterBase {
  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $config = \Drupal::config('collection_import.settings');
    $thumb_size = $config->get('thumbnail_object');
    $main_size = $config->get('main_img_object');
    if (!isset($thumb_size)) {
      $thumb_size = '350';
    }
    if (!isset($main_size)) {
      $main_size = '680';
    }
    $id = $items->getEntity()->id();
    $primary_str = '';
    $primary = $items->getEntity()->field_loris_thumbnail->getValue();
    $credit_line_repro = $items->getEntity()->field_credit_line_repro->getValue();
    if (isset($primary[0]['value']) && !empty(isset($primary[0]['value']))) {
      $primary_str = $primary[0]['value'];
    }
    $elements = array();
    $elements[0]['#theme'] = 'collection_mirador_gallery_formatter';
    if (isset($credit_line_repro[0]['value'])) {
      $elements[0]['#credit'] = $credit_line_repro[0]['value'];
    }
    else {
      $elements[0]['#credit'] = '';
    }
    $pr_delta = -1;
    foreach ($items as $delta => $item) {
      if (strstr($primary_str, $item->value) !== FALSE) {
        $pr_delta = $delta;
        $elements[0]['#urls'][0]['thumb'] = $item->value . '/full/' . $thumb_size . ',/0/default.jpg';
        $elements[0]['#urls'][0]['full'] = $item->value . '/full/' . $main_size . ',/0/default.jpg';
        break;
      }
    }
    if (isset($elements[0]['#urls'])) {
      $counter = count($elements[0]['#urls']);
    }
    else {
      $counter = 0;
    }
    foreach ($items as $delta => $item) {
      $counter++;
      if ($delta !== $pr_delta) {
        $elements[0]['#urls'][$counter]['thumb'] = $item->value . '/full/' . $thumb_size . ',/0/default.jpg';
        $elements[0]['#urls'][$counter]['full'] = $item->value . '/full/' . $main_size . ',/0/default.jpg';
      }
    }
    $entity = $items->getEntity();
    $title = $entity->getTitle();
    $objNumber = $entity->field_object_number->getValue();
    $artist_name = $entity->field_artist_description->getValue();
    $elements[0]['#img_attributes'] = 'loris-img-gallery';
    $elements[0]['#main_id'] = ($id) ? $id : 0;
    $elements[0]['#artist_name'] = (isset($artist_name[0]['value'])) ? $artist_name[0]['value'] : '';
    $elements[0]['#title'] = (isset($title)) ? $title : '';
    $elements[0]['#objNumber'] = (isset($objNumber[0]['value'])) ? $objNumber[0]['value'] : '';
    $elements[0]['#attached'] = array('library' => array('collection_mirador/mirador_prep'));
    return $elements;
  }
}
