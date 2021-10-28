<?php
/**
 * @file
 * Contains Mirador manifest creator class.
 */

namespace Drupal\collection_import;
use Drupal\collection_import\Canvas;

/**
 * Creates mirador manifest JSON.
 */
class SharedCanvasManifest {
  /**
   * @var str $id
   *  ObjectID with the path to the IIIF server.
   */
  protected $id;

  /**
   * @var str $objectLabel
   *  Label of the object.
   */
  protected $objectLabel = '';

  /**
   * @var str $description
   *  Description of the object.
   */
  protected $description = '';

  /**
   * @var array $metadata
   *  Metadata.
   */
  protected $metadata = array();

  /**
   * @var array $canvases
   *  Array of canvases.
   */
  protected $canvases = array();

  /**
   * @var array $attributes
   *  Array of attributes.
   */
  protected $attributes = NULL;

  /**
   * @var str $license
   *  License of the object.
   */
  protected $license = '';

  /**
   * @var str $logo
   *  Logo of the object.
   */
  protected $logo = '';

  /**
   * Instantiate manifest.
   */
  public function __construct($id, $image_viewer_data, $canvas) {
    $this->id = $id;
    $this->objectLabel = $image_viewer_data['label'];
    $this->description = $image_viewer_data['description'];
    $this->attributes = $image_viewer_data['attribution'];
    $this->license = $image_viewer_data['license'];
    $this->logo = $image_viewer_data['logo'];
    $this->metadata = $image_viewer_data['metadata'];
    $this->canvases = $canvas;
  }

  /**
   * Build and return a JSON string based on what we have in the class.
   */
  public function getManifest() {
    //drush_log(var_dump($this->canvases), 'success');
    $sc_manifest = array(
      '@context' => 'http://iiif.io/api/presentation/2/context.json',
      '@id' => $this->id,
      '@type' => 'sc:Manifest',
      'attribution' => $this->attributes,
      'description' => $this->description,
      'label' => $this->objectLabel,
      'licence' => $this->license,
      'logo' => $this->logo,
      'metadata' => $this->metadata,
      'sequences' => array(
        array(
          '@type' => 'sc:Sequence',
          'id' => $this->id,
          'label' => $this->objectLabel,
          'canvases' => $this->canvases,
        ),
      ),
    );
    return $sc_manifest;
  }

}
