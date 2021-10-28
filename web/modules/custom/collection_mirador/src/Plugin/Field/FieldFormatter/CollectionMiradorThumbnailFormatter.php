<?php
/**
 * @file
 * Contains \Drupal\collection_mirador\Plugin\Field\FieldFormatter\collectionMiradorThumbnailFormatter.
 */

namespace Drupal\collection_mirador\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Plugin implementation of the 'collection_mirador_thumb' formatter.
 *
 * @FieldFormatter(
 *   id = "collection_mirador_thumb",
 *   label = @Translation("Collection Mirador Thumbnail"),
 *   field_types = {
 *     "string"
 *   }
 * )
 */
class CollectionMiradorThumbnailFormatter extends FormatterBase {
  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = array();
    foreach ($items as $delta => $item) {
      $elements[$delta]['#theme'] = 'collection_mirador_thumb_formatter';
      $elements[$delta]['#url'] = $item->value;
      $elements[$delta]['#img_attributes'] = 'class=loris-img-thumb';
    }
    return $elements;
  }

}
