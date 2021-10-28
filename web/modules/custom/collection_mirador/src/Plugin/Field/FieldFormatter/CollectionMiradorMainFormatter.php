<?php

/**
 * @file
 * Contains \Drupal\collection_mirador\Plugin\Field\FieldFormatter\MiradorMainFormatter.
 */


namespace Drupal\collection_mirador\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;

/**
 * Plugin implementation of the 'mirador_main' formatter.
 *
 * @FieldFormatter(
 *   id = "mirador_main",
 *   module = "collection_mirador",
 *   label = @Translation("Mirador Main Formatter"),
 *   field_types = {
 *     "string"
 *   }
 * )
 */
class CollectionMiradorMainFormatter extends FormatterBase {
  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {

    $elements = array();
    $manifest = array();
    $id = '';
    foreach ($items as $delta => $item) {
      $id = $item->value;
      $manifest_data = $this->getManifest($id);
      if (!empty($manifest_data) && $manifest_data) {
        $manifest['id'] = $id;
        $manifest['file_name'] = $manifest_data;
      }
      // Early opt-out if the field is empty.
      if (empty($manifest)) {
        return $elements;
      }
      $elements[$delta] = array (
        '#theme' => 'mirador_main_formatter',
        '#manifest' => $manifest,
        '#attached' => array('library' => array('collection_mirador/mirador', 'collection_mirador/mirador_init'), 'drupalSettings' => array('collection_mirador' => array('mirador_init' => array('manifest_name' => $manifest['file_name'], 'manifest_id' => $manifest['id'])))),
      );

    }

    return $elements;
  }

  /**
   * Helper function to get manifest file by manifest id.
   *
   * @param string $manifestId
   *    id of the manifest file.
   *
   * @return TRUE|FALSE
   *
   */
  protected function getManifest($manifestId) {
    $url = file_create_url('public://manifests/' . $manifestId . '.json');
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); //Set curl to return the data instead of printing it to the browser.
    curl_setopt($ch, CURLOPT_URL, $url);
    $data = curl_exec($ch);
    if(!curl_errno($ch)) {
      $info = curl_getinfo($ch,  CURLINFO_HTTP_CODE);
      if($info!= 200) {
        $data = FALSE;
      }
    }
    else {
      $data = FALSE;
    }
    curl_close($ch);
    if ($data) {
      $data = $url;
    }
    return $data;
  }

}
