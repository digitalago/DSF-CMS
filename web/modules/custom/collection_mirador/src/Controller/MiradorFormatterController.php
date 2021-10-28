<?php
/**
 * @file
 * Contains \Drupal\collection_mirador\Controller\MiradorFormatterController.
 */

namespace Drupal\collection_mirador\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;

class MiradorFormatterController extends ControllerBase {

  /**
   * Instantiates Mirador formatter for the individual object page.
   *
   * @param int $nid
   *    object node id.
   */
  public function viewInd($nid) {
    $node = \Drupal\node\Entity\Node::load($nid);
    $values = $node->get('field_mirador_main_formatter')->getValue();
    $element = array(
      '#type' => 'markup',
      '#markup' => '<div></div>',
    );
    if (isset($values) && !empty($values)) {
      $manifest_id = $values[0]['value'];
      if (!empty($manifest_id)) {
        $manifest_data = $this->getManifest($manifest_id);
        if (!empty($manifest_data) && $manifest_data) {
          $manifest['id'] = $manifest_id;
          $manifest['file_name'] = $manifest_data;
        }
        $element['#markup'] = '<div id="' . $manifest_id . '" class="mirador-full"></div>';
        $element['#attached'] = array('library' => array('collection_mirador/mirador', 'collection_mirador/mirador_init'), 'drupalSettings' => array('collection_mirador' => array('mirador_init' => array('manifest_name' => $manifest['file_name'], 'manifest_id' => $manifest['id'], 'node_id' => $nid))));
      }
    }

    return $element;
  }

  /**
   * Instantiates Mirador formatter for the compare objects page.
   *
   */
  public function viewCompare() {
    $element = array(
      '#type' => 'markup',
      '#markup' => '<div>Hello</div>',
    );
    $objIds = $this->parseObjectIds();
    $query_string = \Drupal::request()->query;
    if ($query_string && $query_string->get('my_collection')) {
      $element['#attached']['drupalSettings']['collection_mirador']['mirador_init']['my_collection'] = 1;
    }
    if (!empty($objIds)) {
      $element['#markup'] = '<div id="miradorCompare" class="mirador-full mirador-compare"></div>';
      // attaching JS libraries.
      $element['#attached']['library'][] = 'collection_mirador/mirador';
      $element['#attached']['library'][] = 'collection_mirador/mirador_init';
      foreach ($objIds as $key => $id) {
        $manifest_data = $this->getManifest($id);
        if (!empty($manifest_data) && $manifest_data) {
          $manifest['id'] = $id;
          $manifest['file_name'] = $manifest_data;
          // dynamically attaching JS settings
          $element['#attached']['drupalSettings']['collection_mirador']['mirador_init']['manifests'][$key]['manifest_name'] = $manifest['file_name'];
          $element['#attached']['drupalSettings']['collection_mirador']['mirador_init']['manifests'][$key]['manifest_id'] = $manifest['id'];
        }
      }
    }
    return $element;
  }


  /**
   * Helper function to parse object ids from the query string.
   *
   * @return array ids
   *    arry of object ids.
   */
  protected function parseObjectIds() {
    $query_string = \Drupal::request()->query;
    $ids = array();
    if ($query_string) {
      $objects = $query_string->get('objects');
      if (isset($objects) && !empty($objects)) {
        $ids = explode(',', $objects);
      }
    }
    return $ids;
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
