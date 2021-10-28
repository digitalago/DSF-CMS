<?php
/**
 * @file
 * Contains Drupal\collection_import\Plugin\QueueWorker\ImportSaveJsonDataBase.php
 */

namespace Drupal\collection_import\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\node\Entity\Node;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Component\Serialization\Json;
use Drupal\collection_import\SharedCanvasManifest;
use Drupal\collection_import\Canvas;
use Drupal\file\Entity\File;
use \ForceUTF8\Encoding;
use Drupal\Core\Database\Database;


/**
 * Provides Base parsing functionality for the JSON records of portfolio and TMS records.
 */
abstract class ImportSaveJsonDataBase extends QueueWorkerBase implements ContainerFactoryPluginInterface {

  /**
   * @var EntityManagerInterface.
   */
  protected $entity_manager;

  /**
   * @var QueryFactory.
   */
  protected $entity_query;

  /**
   * @var array().
   */
  protected $objects = array();

  /**
   * @var string
   */
  protected $object_type = 'object_type';

  /**
   * @var string
   */
  protected $time_period = 'time_period';

  /**
   * @var string
   */
  protected $previous_owner = 'previous_owner';

  /**
   * @var string
   */
  protected $subjects = 'subject';

  /**
   * @var string
   */
  protected $category = 'object_category';

  /**
   * @var string
   */
  protected $institution_organization = 'institution_organization';

  /**
   * @var string
   */
  protected $object_name = 'object_name';

  /**
   * @var string
   */
  protected $loris_url = '';

  /**
   * @var string
   */
  protected $collection_thumb = '350';

  /**
   * {@inheritdoc}
   */
  public function __construct(EntityTypeManagerInterface $entity_manager, QueryFactory $entity_query) {
    $this->entity_manager = $entity_manager;
    $this->entity_query = $entity_query;
    $config = \Drupal::config('collection_import.settings');
    $loris_url = $config->get('loris_url');
    if (isset($loris_url)) {
      $this->loris_url = $loris_url;
    }
    $loris_thumb = $config->get('thumbnail_collection');
    if (isset($loris_thumb)) {
      $this->collection_thumb = $loris_thumb;
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $container->get('entity.manager'),
      $container->get('entity.query')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function processItem($data) {
    $update_keys = array('portfolio', 'portfolio_clean', 'manifest', 'artist', 'artist_clean', 'related_clean', 'related',);
    // checking object id from the db for TMS records.
    if (isset($data->content['exportIndicator']) && $data->content['exportIndicator'] == 'taxonomy') {
      $this->clearTaxonomy($data->content['info']['vid']);
    }
    elseif (isset($data->key) && $data->key == 'taxonomy') {
      $this->clearTaxonomy($data->info['vid']);
    }
    elseif (isset($data->info['ObjectID']) && $data->key == 'tms') {

      $nid = $this->checkObjectId($data->info['ObjectID']);
      if (isset($nid) && !in_array($nid, $this->objects)) {
        $this->objects[$data->info['ObjectID']] = $nid;
      }
    }
    // for update records checking if we have it alredy pulled
    elseif (isset($data->info['ObjectID']) && isset($this->objects[$data->info['ObjectID']]) && in_array($data->key, $update_keys)) {
      $nid = $this->objects[$data->info['ObjectID']];
    }
    // last attempt to find it in db.
    elseif (isset($data->info['ObjectID']) && in_array($data->key, $update_keys)) {
      $nid = $this->checkObjectId($data->info['ObjectID']);
    }
    // no object id let's go away!
    elseif (!isset($data->info['ObjectID'])) {
      \Drupal::logger('collection_import')->notice('Object was not provided for the record please check your JSON data for the key @key', array('@key' => $data->key));
      return;
    }

    // saving or updating nodes.
    if (isset($nid) && isset($data->key) && $data->key !== 'manifest') {
      $this->updateObjectNode($data->info, $nid, $data->key);
    }
    elseif (!isset($nid) && $data->key == 'tms') {
      $nid = $this->buildObjectNode($data->info);
      $this->objects[$data->info['ObjectID']] = $nid;
    }
    elseif (!isset($nid) && in_array($data->key, $update_keys) && isset($data->info['ObjectId'])) {
      \Drupal::logger('collection_import')->notice('Object with object id @id, was not found.', array('@id' => $data->info['ObjectId']));
      return;
    }
    // creating manifest files.
    elseif (isset($nid) && isset($data->key) && $data->key == 'manifest') {
      $this->buildManifest($data->info['ObjectID'], $nid);
    }
  }

  /**
   * Helper function to build Object node based on TMS record.
   *
   * @param array $node_data
   *    array of node data values.
   */
  protected function buildObjectNode($node_data) {
    $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
    if (isset($node_data['PackageName']) && !empty($node_data['PackageName'])) {
      $package_name = explode(';', $node_data['PackageName']);
      foreach ($package_name as $key => $pn) {
        $global_tid[] = $this->mapGlobalCollectionTaxonomy($pn);
      }
    }

    // creating tids links.
    // object type.
    $type_tid = $this->routeToMapTid($node_data, 'ObjectType', $this->object_type);
    // time period.
    $period_tid = $this->routeToMapTid($node_data, 'TimePeriod', $this->time_period);
    // institution/owner.
    $inst_tid = $this->routeToMapTid($node_data, 'Owner', $this->institution_organization);
    // previous owner.
    $previous_owner = $this->routeToMapTid($node_data, 'ExOwner', $this->previous_owner);
    // subjects.
    $subjects = $this->routeToMapTid($node_data, 'Subject', $this->subjects);
    // categories.
    $categories = $this->routeToMapTid($node_data, 'Category', $this->category);
    // object name.
    $object_name = $this->routeToMapTid($node_data, 'ObjectName', $this->object_name);
    if (isset($node_data['Title']) && !empty($node_data['Title'])) {
      $title = substr($node_data['Title'], 0, 254);
    }
    else {
      $title = 'Untitled';
    }
    $values = array(
      'nid' => NULL,
      'type' => 'object',
      'title' => $title,
      'uid' => 1,
      'status' => TRUE,
      'langcode' => $language,
      'field_object_id' => array('value' => $node_data['ObjectID']),
      'field_object_name' => array('value' => $node_data['ObjectName']),
      'field_date_text' => array('value' => $node_data['Dated']),
      'field_dimensions' => array('value' => $node_data['Dimensions']),
      'field_location' => array('value' => $node_data['LocationString']),
      'field_medium' => array('value' => $node_data['Medium']),
      'field_object_number' => array('value' => ($node_data['ObjectNumber']) ? $node_data['ObjectNumber'] : $node_data['OriginalObjectNumber']),
      'field_provenance' => array('value' => $node_data['Provenance']),
      'field_published_reference' => array('value' => $node_data['PublishedReferences']),
      'body' => array('value' => $node_data['Description']),
      'field_credit_line' => array('value' => $node_data['CreditLine']),
      'field_signature' => array('value' => $node_data['Signature']),
      'field_inscription' => array('value' => $node_data['Inscription']),
      'field_inscription_source' => array('value' => $node_data['InscriptionSource']),
      'field_markings' => array('value' => $node_data['Markings']),
      'field_provenance_remarks' => array('value' => $node_data['ProvenanceRemarks']),
      'field_links' => array('uri' => $node_data['ExternalLink'], 'title' => 'View this object on the source website'),
      'field_catalogue_reference' => array('value' => $node_data['CatalogueReference']),
      'field_exhibition_history' => array('value' => $node_data['ExhibitionHistory']),
      'field_place_of_origin' => array('value' => $node_data['PlaceOfOrigin']),
      //'field_obj_rights_type' => array('value' => $node_data['ObjRightsType']),
      'field_restrictions' => array('value' => $node_data['Restrictions']),
      'field_credit_line_repro' => array('value' => $node_data['CreditLineReproduction']),
      'field_is_zoom_allowed' => array('value' => $node_data['OnlineZoom']),
    );

    if (isset($global_tid)) {
      $values['field_global_collection'] = $global_tid;
    }

    if (isset($node_data['GalleryNumber'])) {
      $values['field_gallery_number'] = array('value' => $node_data['GalleryNumber']);
    }

    $this->setTermsFields($type_tid, NULL, $values, 'field_object_type');
    $this->setTermsFields($period_tid, NULL, $values, 'field_time_period');
    $this->setTermsFields($inst_tid, NULL, $values, 'field_institution');
    $this->setTermsFields($previous_owner, NULL, $values, 'field_previous_owners');
    $this->setTermsFields($subjects, NULL, $values, 'field_subjects');
    $this->setTermsFields($categories, NULL, $values, 'field_categories');
    $this->setTermsFields($object_name, NULL, $values, 'field_object_name_reference');
    $node = $this->entity_manager->getStorage('node')->create($values);
    $this->updateScheduler($node, $node_data);
    $node->save();
    return $node->id();
  }


  /**
   * Helper function to update scheduling information.
   *
   * @param stdObj $node
   *    node object.
   *
   * @param array $node_data
   *    node data array from CSV.
   */
  function updateScheduler($node, $node_data) {
    if (isset($node_data['ExpirationDate']) && !empty($node_data['ExpirationDate'])) {
      $time = $node_data['ExpirationDate'] . ' 00:00:00' . 'America/Toronto';
      $time = strtotime($time);
      $time_now = time();
      if ($time_now > $time) {
        $node->status = 0;
      }
      else {
        $node->get('unpublish_on')->setValue(array('value' => strtotime($node_data['ExpirationDate'] . ' 00:00:00' . 'America/Toronto')));
      }
    }
    else {
      $node->get('unpublish_on')->setValue(array());
    }
  }

  /**
   * Helper function to set values for the term fields.
   *
   * @param int $term
   *    id of the term.
   *
   * @param $node object.
   *
   * @param array $values
   *    array of node values.
   *
   * @param str $field_name
   *    name of the field.
   */
  protected function setTermsFields($term, $node = NULL, &$values, $field_name) {
    if (isset($term) && !isset($node) && !empty($values)) {
      $values[$field_name] = $term;
    }
    elseif (isset($term) && isset($node)) {
      $node->{$field_name}->setValue($term);
    }
  }

  /**
   * Helper function to update Object node based on Portfolio record.
   *
   * @param array $node_data
   *    array of node data values.
   *
   * @param int $nid
   *    id of the node that needs to be updated.
   */
  protected function updateObjectNode($node_data, $nid, $key) {
    $node = $this->entity_manager->getStorage('node')->load($nid);
    if (isset($node)) {
      switch ($key) {
        case 'tms':
          //drush_log('tms update', 'success');
          if (isset($node_data['STATUS']) && $node_data['STATUS'] === 'DELETE') {
            $node->setPublished(FALSE);
            return;
          }
          // TODO: it takes insert an update for testing now. Do only Update later on.
          elseif (isset($node_data['STATUS']) && ($node_data['STATUS'] === 'INSERT' || $node_data['STATUS'] === 'UPDATE')) {
            $node->status = 1;
            if (isset($node_data['Title']) && !empty($node_data['Title'])) {
              $node->title = substr($node_data['Title'], 0, 254);
            }
            else {
              $node->title = 'Untitled';
            }
            $node->setPublished(TRUE);
            // creating tids links.
            // object type.
            $type_tid = $this->routeToMapTid($node_data, 'ObjectType', $this->object_type);
            // time period.
            $period_tid = $this->routeToMapTid($node_data, 'TimePeriod', $this->time_period);
            // institution/owner.
            $inst_tid = $this->routeToMapTid($node_data, 'Owner', $this->institution_organization);
            // previous owner.
            $previous_owner = $this->routeToMapTid($node_data, 'ExOwner', $this->previous_owner);
            // subjects.
            $subjects = $this->routeToMapTid($node_data, 'Subject', $this->subjects);
            // categories.
            $categories = $this->routeToMapTid($node_data, 'Category', $this->category);
            // object name.
            $name_tid = $this->routeToMapTid($node_data, 'ObjectName', $this->object_name);
            if (isset($node_data['PackageName']) && !empty($node_data['PackageName'])) {
              $package_name = explode(';', $node_data['PackageName']);
              foreach ($package_name as $key => $pn) {
                $global_tid[] = $this->mapGlobalCollectionTaxonomy($pn);
              }
            }
            // object id update.
            $node->field_object_id->value = $node_data['ObjectID'];

            $this->prepareUpdate($node_data, 'ObjectName', 'field_object_name', $node);
            $this->prepareUpdate($node_data, 'Dated', 'field_date_text', $node);
            $this->prepareUpdate($node_data, 'Dimensions', 'field_dimensions', $node);
            $this->prepareUpdate($node_data, 'Dimensions', 'field_dimensions', $node);
            $this->prepareUpdate($node_data, 'Description', 'body', $node);
            $this->prepareUpdate($node_data, 'LocationString', 'field_location', $node);
            $this->prepareUpdate($node_data, 'Medium', 'field_medium', $node);
            $this->prepareUpdate($node_data, 'OriginalObjectNumber', 'field_object_number', $node);
            $this->prepareUpdate($node_data, 'Provenance', 'field_provenance', $node);
            $this->prepareUpdate($node_data, 'PublishedReferences', 'field_published_reference', $node);
            $this->prepareUpdate($node_data, 'CreditLine', 'field_credit_line', $node);
            $this->prepareUpdate($node_data, 'Signature', 'field_signature', $node);
            $this->prepareUpdate($node_data, 'Inscription', 'field_inscription', $node);
            $this->prepareUpdate($node_data, 'InscriptionSource', 'field_inscription_source', $node);
            $this->prepareUpdate($node_data, 'Markings', 'field_markings', $node);
            $this->prepareUpdate($node_data, 'ProvenanceRemarks', 'field_provenance_remarks', $node);
            $node->field_links->setValue(array());
            $node->field_links->appendItem(array('uri' => $node_data['ExternalLink'], 'title' => 'View this object on the source website'));
            $this->prepareUpdate($node_data, 'CatalogueReference', 'field_catalogue_reference', $node);
            $this->prepareUpdate($node_data, 'ExhibitionHistory', 'field_exhibition_history', $node);
            $this->prepareUpdate($node_data, 'PlaceOfOrigin', 'field_place_of_origin', $node);
            //$this->prepareUpdate($node_data, 'ObjRightsType', 'field_obj_rights_type', $node);
            $this->prepareUpdate($node_data, 'Restrictions', 'field_restrictions', $node);
            $this->prepareUpdate($node_data, 'CreditLineReproduction', 'field_credit_line_repro', $node);
            $this->prepareUpdate($node_data, 'TimePeriod', 'field_time_period', $node);
            $this->prepareUpdate($node_data, 'OnlineZoom', 'field_is_zoom_allowed', $node);
            if (isset($node_data['GalleryNumber'])) {
              $this->prepareUpdate($node_data, 'GalleryNumber', 'field_gallery_number', $node);
            }

            //$node->field_related_works->setValue(array());
            $node->field_object_name_reference->setValue(array());
            $empty_buf = array();
            $this->setTermsFields($type_tid, $node, $empty_buf, 'field_object_type');
            $this->setTermsFields($period_tid, $node, $empty_buf, 'field_time_period');
            $this->setTermsFields($inst_tid, $node, $empty_buf, 'field_institution');
            $this->setTermsFields($previous_owner, $node, $empty_buf, 'field_previous_owners');
            $this->setTermsFields($subjects, $node, $empty_buf, 'field_subjects');
            $this->setTermsFields($categories, $node, $empty_buf, 'field_categories');
            $this->setTermsFields($name_tid, $node, $empty_buf, 'field_object_name_reference');
            $node->field_global_collection->setValue($global_tid);
            $this->updateScheduler($node, $node_data);
            $node->save();
          }
        break;
        case 'portfolio_clean':
          // cleaning up before attaching new images.
          $node->field_portfolio_image_data->setValue(array());
          $node->field_loris_thumbnail->setValue(array());
          $node->field_loris_gallery->setValue(array());
          $node->save();
        break;
        case 'portfolio':
          //drush_log($node_data['STATUS'], 'success');
          if ($node_data['STATUS'] == 'UPDATE' || $node_data['STATUS'] == 'INSERT') {

            $portfolio_data = array();
            $portfolio_data['filename'] = strtolower($node_data['FileName']);
            $portfolio_data['pixel_h'] = $node_data['PixelH'];
            $portfolio_data['pixel_w'] = $node_data['PixelW'];
            $portfolio_data['primary_display'] = $node_data['PrimaryDisplay'];

            // generating thumbnail for Loris.
            if (isset($node_data['PrimaryDisplay']) && $node_data['PrimaryDisplay'] == 1 && isset($node_data['FileName']) && !empty($node_data['FileName'])) {
              $name = str_replace('jpeg', 'jpg', strtolower($node_data['FileName']));
              $name = str_replace('tif', 'jpg', $name);
              $use_width_flag = TRUE;
              if ($node_data['PixelH'] > $node_data['PixelW']) {
                $use_width_flag = FALSE;
              }
              if ($use_width_flag) {
                $thumb = $this->loris_url . $name . "/full/" . $this->collection_thumb . ",/0/default.jpg";
              }
              else {
                $thumb = $this->loris_url . $name . "/full/," . $this->collection_thumb . "/0/default.jpg";
              }
              //$thumb = "http://97.107.138.96/loris/" . $name . "/pct:25,0,50,100/full/0/default.jpg";
              $node->field_loris_thumbnail->setValue($thumb);
              $node->field_mirador_main_formatter->setValue($node_data['ObjectID']);
            }

            // generating thumbnails and images for Object Gallery.
            if (isset($node_data['FileName']) && !empty($node_data['FileName'])) {
              //$name = str_replace('jpeg', 'jpg', $node_data['FileName']);
              //$name = str_replace('tif', 'jpg', $name);
              $img = $this->loris_url . strtolower($node_data['FileName']);
              $node->field_loris_gallery->appendItem($img);
            }

            if (!empty($portfolio_data) && $node->isPublished()) {
              $encoded_data = Json::encode($portfolio_data);
              $node->field_portfolio_image_data->appendItem($encoded_data);
              $node->save();
            }
          }
        break;
        case 'artist_clean':
          $node->field_artist_maker->setValue(array());
          $node->field_artist_description->setValue(array());
          $node->save();
        break;
        case 'artist':
          if ($node_data['STATUS'] == 'UPDATE' || $node_data['STATUS'] == 'INSERT') {
            $nidArt = $this->checkArtistExists($node_data);
            if (!isset($nidArt)) {
              $nidArt = $this->createArtist($node_data);
            }
            if (isset($nidArt)) {
              $artist_description = '';
              // Update artist reference
              if (isset($node_data['Prefix']) && !empty($node_data['Prefix'])) {
                $artist_description .= $node_data['Prefix'] . ' ';
              }
              if (isset($node_data['DisplayName']) && !empty($node_data['DisplayName'])) {
                $artist_description .= $node_data['DisplayName'];
              }
              if (isset($node_data['Suffix']) && !empty($node_data['Suffix'])) {
                $artist_description .= ' ' . $node_data['Suffix'];
              }
              //$node->field_artist_description->appendItem($artist_description);
              $node->field_artist_maker->appendItem($nidArt);
              $node->save();
              $artistNode = $this->entity_manager->getStorage('node')->load($nidArt);
              $this->updateArtistValues($artistNode, $node_data);
              $artistNode->save();
            }
            else {
              \Drupal::logger('collection_import')->notice('Couldn\'t create an artist');
            }
          }
          else {
            $nidArt = $this->checkArtist($node_data['ObjectID']);
            if (isset($nidArt)) {
              $artistNode = $this->entity_manager->getStorage('node')->load($nidArt);
              $artistNode->setPublished(FALSE);
              return;
            }
          }
        break;
        case 'related_clean':
          $node->field_related_works->setValue(array());
          $node->save();
        break;
        case 'related':
          if (($node_data['STATUS'] == 'UPDATE' || $node_data['STATUS'] == 'INSERT') && isset($node_data['RelatedObjectID'])) {
            $nidRel = $this->getRelatedObjectId($node_data['RelatedObjectID']);
            if (isset($nidRel)) {
              $rel_values = $node->field_related_works->getValue();
              $saved_values = array();
              if (!empty($rel_values)) {
                foreach ($rel_values as $k => $rv) {
                  if (isset($rv['target_id']) && !empty($rv['target_id'])) {
                    $saved_values[] = $rv['target_id'];
                  }
                }
                if (!in_array($nidRel, $saved_values)) {
                  $node->field_related_works->appendItem($nidRel);
                  $node->save();
                }
              }
              else {
                $node->field_related_works->appendItem($nidRel);
                $node->save();
              }
            }
            else {
              \Drupal::logger('collection_import')->notice('Couldn\'t find a related object for object nid @id', array('@id' => $nid));
            }
          }
        break;
      }
    }
    else {
      \Drupal::logger('collection_import')->notice('Couldn\'t load the node for update base on nid @id', array('@id' => $nid));
    }
  }


  /**
   * Helper function to get related objects by Object Ids.
   *
   * @param int $objectId
   *    id of the object.
   *
   * @return int $nid | NULL
   *    node id of the related object node.
   */
  protected function getRelatedObjectId($objectId) {
    $query = $this->entity_query->get('node');
    $query->condition('field_object_id', $objectId, '=');
    $query->condition('type', 'object', '=');
    $result = $query->execute();
    if (!empty($result)) {
      return reset($result);
    }
    else {
      return NULL;
    }
  }

  /**
   * Helper function to delete all of the object related taxonomies before the import.
   *
   * @param str $vid
   *    vocabulary id.
   */
  protected function clearTaxonomy($vid) {
    //drush_log('clear', 'success');
    $taxonomy = $this->entity_manager->getStorage('taxonomy_term')->loadTree($vid, 0, NULL, TRUE);
    foreach ($taxonomy as $term) {
      $is_delete = $this->check_if_in_use($term->id());
      if ($is_delete) {
        //drush_log($term->id(), 'success');
        $term->delete();
      }
    }
  }

  /**
   * Helper function to check if taxonomy term is in use.
   *
   * @param int $tid
   *    taxonomy term id.
   *
   * @return TRUE|FALSE
   *    if taxonomy needs to be deleted.
   */
  protected function check_if_in_use($tid) {
    $db = Database::getConnection('default', 'default');
    $query = $db->select('taxonomy_index', 't');
    $query->fields('t', array('tid'));
    $query->condition('t.tid', $tid);
    $res = $query->execute()->fetchAll();
    if (empty($res)) {
      return TRUE;
    }
    else {
      return FALSE;
    }
  }

  /**
   * Helper function to check if we need to map a taxonomy, create a new one or fallback to default one.
   *
   * @param array $data
   *    array of node data values.
   *
   * @param string $key
   *    key of the array that needs to be used.
   *
   * @return int $tid
   *    mapped term id.
   */
  protected function routeToMapTid($data, $key, $tree) {
    $tids = array();
    if (isset($data[$key]) && !empty(trim($data[$key]))) {
      $arr = explode(";", $data[$key]);
      foreach ($arr as $value) {
        $tid = $this->mapSearchableTerms(trim($value), $tree);
        $tids[] = $tid;
      }
    }
    else {
      // Unsorted taxonomy is important due to the BEF issue.
      //$tids[] = $this->mapSearchableTerms('Unsorted', $tree);
    }
    return $tids;
  }

  /**
   * Helper function to check if artist already exists.
   *
   * @param int $objectId
   *    TMS object id.
   */
  protected function checkArtist($objectId) {
    $query = $this->entity_query->get('node');
    $query->condition('field_object_id', $objectId, '=');
    $query->condition('type', 'artist_maker', '=');
    $result = $query->execute();
    if (!empty($result)) {
      return reset($result);
    }
    else {
      return NULL;
    }
  }

  /**
   * Helper function to create an artist node.
   *
   * @param array $node_data
   *    array of CSV node data.
   *
   * @return int $nid
   *    node id of just created node.
   */
  protected function createArtist($node_data) {
    $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
    $values = array(
      'nid' => NULL,
      'type' => 'artist_maker',
      'title' => substr($node_data['DisplayName'], 0, 254),
      'uid' => 1,
      'status' => TRUE,
      'langcode' => $language,
      'field_object_id' => array('value' => $node_data['ObjectID']),
      'body' => array('value' => $node_data['DisplayBio']),
      'field_prefix' => array('value' => $node_data['Prefix']),
      'field_suffix' => array('value' => $node_data['Suffix']),
      'field_first_name' => array('value' => $node_data['FirstName']),
      'field_last_name' => array('value' => $node_data['LastName']),
      'field_alpha_sort' => array('value' => $node_data['AlphaSort']),
      'field_alternate_names' => array('value' => $node_data['AltDisplayName']),
      'field_birth_place' => array('value' => $node_data['BirthPlace']),
      'field_death_place' => array('value' => $node_data['DeathPlace']),
      'field_nationality' => array('value' => $node_data['Nationality']),
    );

    if (isset($node_data['DisplayName']) && is_string($node_data['DisplayName'])) {
      $values['field_first_letter_index'] = array('value' => strtoupper(substr($this->make_safe_for_utf8_use($node_data['DisplayName']), 0, 1)));
    }
    $node = $this->entity_manager->getStorage('node')->create($values);
    $node->save();
    return $node->id();
  }

  /**
   * Helper function to update values for the artist node.
   *
   * @param stdClass $node
   *    artist node.
   *
   * @param array $node_data
   *    array of node data.
   */
  protected function updateArtistValues($node, $node_data) {
    $fields = ['field_object_id', 'body', 'field_prefix', 'field_suffix', 'field_first_name', 'field_last_name', 'field_alpha_sort', 'field_alternate_names', 'field_birth_place', 'field_death_place', 'field_nationality'];
    $keys = ['ObjectID', 'DisplayBio', 'Prefix', 'Suffix', 'FirstName', 'LastName', 'AlphaSort', 'AltDisplayName', 'BirthPlace', 'DeathPlace', 'Nationality'];
    foreach ($fields as $key => $field) {
      $node->{$field}->setValue(array('value' => $node_data[$keys[$key]]));
    }
  }

  protected function make_safe_for_utf8_use($string) {
    $normalizeChars = array(
      'Š'=>'S', 'š'=>'s', 'Ð'=>'Dj','Ž'=>'Z', 'ž'=>'z', 'À'=>'A', 'Á'=>'A', 'Â'=>'A', 'Ã'=>'A', 'Ä'=>'A',
      'Å'=>'A', 'Æ'=>'A', 'Ç'=>'C', 'È'=>'E', 'É'=>'E', 'Ê'=>'E', 'Ë'=>'E', 'Ì'=>'I', 'Í'=>'I', 'Î'=>'I',
      'Ï'=>'I', 'Ñ'=>'N', 'Ń'=>'N', 'Ò'=>'O', 'Ó'=>'O', 'Ô'=>'O', 'Õ'=>'O', 'Ö'=>'O', 'Ø'=>'O', 'Ù'=>'U', 'Ú'=>'U',
      'Û'=>'U', 'Ü'=>'U', 'Ý'=>'Y', 'Þ'=>'B', 'ß'=>'Ss','à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a',
      'å'=>'a', 'æ'=>'a', 'ç'=>'c', 'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e', 'ì'=>'i', 'í'=>'i', 'î'=>'i',
      'ï'=>'i', 'ð'=>'o', 'ñ'=>'n', 'ń'=>'n', 'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o', 'ö'=>'o', 'ø'=>'o', 'ù'=>'u',
      'ú'=>'u', 'û'=>'u', 'ü'=>'u', 'ý'=>'y', 'ý'=>'y', 'þ'=>'b', 'ÿ'=>'y', 'ƒ'=>'f',
      'ă'=>'a', 'î'=>'i', 'â'=>'a', 'ș'=>'s', 'ț'=>'t', 'Ă'=>'A', 'Î'=>'I', 'Â'=>'A', 'Ș'=>'S', 'Ț'=>'T',
    );
    return strtr($string, $normalizeChars);
  }

  /**
   * Helper function to check that artist with the following name exists.
   *
   * @param array $node_data
   *    array of CSV node data.
   *
   * @return int $nid | NULL
   *    node id of found node.
   */
  protected function checkArtistExists($node_data) {
    $title = substr($node_data['DisplayName'], 0, 254);
    $query = $this->entity_query->get('node');
    $query->condition('title', trim($title), '=');
    $query->condition('type', 'artist_maker', '=');
    $result = $query->execute();
    if (!empty($result)) {
      return reset($result);
    }
    else {
      return NULL;
    }
  }

  /**
   * Helper function to update artist information.
   *
   * @param array $node_data
   *    array of CSV node data.
   *
   * @param int $nid
   *    node id.
   */
  protected function updateArtist($node_data, $nid) {
    $node = $this->entity_manager->getStorage('node')->load($nid);
    if (isset($node)) {
      $this->prepareUpdate($node_data, 'ObjectID', 'field_object_id', $node);
      $this->prepareUpdate($node_data, 'Prefix', 'field_prefix', $node);
      $this->prepareUpdate($node_data, 'Suffix', 'field_suffix', $node);
      $this->prepareUpdate($node_data, 'DisplayBio', 'body', $node);
      $this->prepareUpdate($node_data, 'FirstName', 'field_first_name', $node);
      $this->prepareUpdate($node_data, 'LastName', 'field_last_name', $node);
      $this->prepareUpdate($node_data, 'AlphaSort', 'field_alpha_sort', $node);
      $node->title = substr($node_data['DisplayName'], 0, 254);
      $node->save();
    }
  }

  /**
   * Helper function to prepare update of the node.
   *
   * @param array $node_data
   *    array of data parsed from CSV.
   *
   * @param str $property_name
   *    property name in the array of data.
   *
   * @param str $field_name
   *    name of the field that needs to be updated.
   *
   * @param $node object.
   *
   */

  protected function prepareUpdate($node_data, $property_name, $field_name, $node) {
    if (isset($node_data[$property_name]) && !empty($node_data[$property_name])) {
      if ($property_name == 'OriginalObjectNumber') {
        $node->{$field_name}->value = ($node_data['ObjectNumber']) ? $node_data['ObjectNumber'] : $node_data['OriginalObjectNumber'];
      }
      else {
        $node->{$field_name}->value = $node_data[$property_name];
      }
    }
    elseif (isset($node->{$field_name}->value)) {
      $node->{$field_name}->value = '';
    }
  }

  /**
   * Helper function to map global collection taxonomy to the objects.
   *
   * @param str $package_name
   *    name of the package object belongs to.
   */
  protected function mapGlobalCollectionTaxonomy($package_name) {
    $taxonomy_tree = $this->entity_manager->getStorage('taxonomy_term')->loadTree('global_collection');
    if (!empty($taxonomy_tree) && is_array($taxonomy_tree)) {
      foreach ($taxonomy_tree as $term) {
        // TODO: Maybe instead of mapping in code we need to ensure that terms match package name.
        switch ($package_name) {
          case 'collection_online':
            if ($term->name === 'collection') {
              return $term->tid;
            }
          break;
          case 'Unassigned':
            if ($term->name === 'Unassigned') {
              return $term->tid;
            }
          break;
        }
      }
      return $this->mapSearchableTerms($package_name,'global_collection');
    }
    return NULL;
  }

  /**
   * Helper function to map searchable import related taxonomy terms to their tids.
   *
   * @param str $term_name
   *    term or potential term name.
   *
   * @param str $taxonomy_tree
   *    name of the txonomy tree that needs to be loaded.
   *
   * @return $tid
   *    mapped term id.
   */
  protected function mapSearchableTerms($term_name, $taxonomy_tree) {
    $taxonomy = $this->entity_manager->getStorage('taxonomy_term')->loadTree($taxonomy_tree);
    if (!empty($taxonomy) && is_array($taxonomy)) {
      foreach ($taxonomy as $term) {
        if ($term->name === trim($term_name)) {
          return $term->tid;
        }
      }
      // if we're here it means that we didn't find any matching taxonomy.
      $tid = $this->createSearchableTaxonomy(trim($term_name), $taxonomy_tree);
      if (isset($tid)) {
        return $tid;
      }
    }
    else {
      $tid = $this->createSearchableTaxonomy(trim($term_name), $taxonomy_tree);
      if (isset($tid)) {
        return $tid;
      }
    }
  }

  /**
   * Helper function to create new taxonomy term.
   *
   * @param str $term_name
   *    term or potential term name.
   *
   * @param str $taxonomy_tree
   *    name of the txonomy tree that needs to be loaded.
   *
   * @return $tid
   *    mapped term id.
   */
  protected function createSearchableTaxonomy($term_name, $taxonomy_tree) {
    $values = array(
      'name' => $term_name,
      'vid' => $taxonomy_tree,
    );
    $term = $this->entity_manager->getStorage('taxonomy_term')->create($values);
    $term->save();
    return $term->id();
  }

  /**
   * Helper function to check if particular object id already exists on the site.
   *
   * @param int $objectId
   *    TMS object id.
   */
  protected function checkObjectId($objectId) {
    $query = $this->entity_query->get('node');
    $query->condition('field_object_id', $objectId, '=');
    $query->condition('type', 'object', '=');
    $result = $query->execute();
    if (!empty($result)) {
      return reset($result);
    }
    else {
      return NULL;
    }
  }

  /**
   * Helper funcition to build manifests for image objects.
   *
   * @param int $objectId
   *    id of the object in TMS.
   *
   * @param int $nid
   *    node id of the object in Drupal DB.
   */
  protected function buildManifest($objectId, $nid) {
    $node = $this->entity_manager->getStorage('node')->load($nid);
    if (!$node->isPublished()) {
      // TODO: Check if corresponding manifest exists. Delete it.
      return;
    }
    // get image viewer info.
    $image_viewer_data = $this->getImagesData($nid);
    // create an instance of Canvas class.
    $canvas = new Canvas($this->loris_url . $objectId, $image_viewer_data['label'], $image_viewer_data['images']);
    $canvas_data = $canvas->toArray();
    // create an instance of SharedCanvasManifest class.
    $manifest = new SharedCanvasManifest($this->loris_url . $objectId, $image_viewer_data, $canvas_data);
    $manifest_data = $manifest->getManifest();
    // save manifest to file.
    if (!empty($manifest_data)) {
      file_save_data(json_encode($manifest_data), 'public://manifests/' . $objectId . '.json', FILE_EXISTS_REPLACE);
    }
  }


  /**
   * Helper function to get Images information related to the object node.
   */
  protected function getImagesData($nid) {
    $node = $this->entity_manager->getStorage('node')->load($nid);
    $images_data = $node->get('field_portfolio_image_data')->getValue();
    $images = array();
    if (isset($images_data) && !empty($images_data)) {
      $images_data = $this->sortImagesData($images_data);
      //drush_log(var_dump($images_data), 'success');
      foreach ($images_data as $key => $image) {
        if (isset($image['value']) && !empty($image['value'])) {
          $img_json = json_decode($image['value'], TRUE);
          if (!empty($img_json) && is_array($img_json)) {
            //$images[$key]['image_uri'] = $this->loris_url . str_replace('jpeg', 'jpg', $img_json['filename']);
            $images[$key]['image_uri'] = $this->loris_url . strtolower($img_json['filename']);
            $images[$key]['image_height'] = $img_json['pixel_h'];
            $images[$key]['image_width'] = $img_json['pixel_w'];
          }
        }
      }
    }
    $image_viewer_data['label'] = $node->getTitle();
    // We don't have the description.
    $image_viewer_data['description'] = '';
    $image_viewer_data['metadata'] = array();
    $image_viewer_data['license'] = $node->get('field_copyright')[0]['value'];
    $image_viewer_data['attribution'] = NULL;
    // Mirador doesn't care about logo it has hardcoded one.
    $image_viewer_data['logo'] = NULL;
    $image_viewer_data['images'] = $images;
    return $image_viewer_data;
  }

  /**
   * Helper function to sort imaged array before creating a manifest.
   *
   * @param array $images_data
   *    array of images data for the object
   *
   * @return array $images_data_clean
   *    array of sorted images data
   */
  protected function sortImagesData($images_data) {
    $images_data_clean = array();
    $primary_key = -1;
    foreach ($images_data as $key => $image) {
      if (isset($image['value']) && !empty($image['value'])) {
        $img_json = json_decode($image['value'], TRUE);
        if (!empty($img_json) && is_array($img_json) && isset($img_json['primary_display']) && $img_json['primary_display'] == 1) {
          $images_data_clean[] = $image;
          $primary_key = $key;
          break;
        }
      }
    }
    //drush_log($primary_key, 'success');
    foreach ($images_data as $key => $data) {
      if ($key != $primary_key) {
        $images_data_clean[] = $data;
      }
    }
    return $images_data_clean;
  }

}
