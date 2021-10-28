<?php
/**
 * @file
 * Contains Canvas creator class.
 */
namespace Drupal\collection_import;

/**
 * Creates mirador manifest JSON.
 */
class Canvas {
  /**
   * @var str $id
   *    ObjectID with the path to the IIIF server.
   */
  protected $objectId;

  /**
   * @var str $objectLabel
   *    Label of the object.
   */
  protected $objectLabel;

  /**
   * @var array $imagesData
   *    Data for related to the object Images.
   */
  protected $imagesData;


  /**
   * @var array $images
   *    Array of formatted metadata for images.
   */
  protected $images = array();

  protected $maxImageHeight = 4537;
  protected $maxImageWidth = 4537;

  /**
   * Instantiate the canvas.
   */
  public function __construct($id, $label, $imagesData) {
    $this->objectId = $id;
    $this->objectLabel = $label;
    $this->imagesData = $imagesData;
    $this->setImages();
  }

  /**
   * Add image to canvas.
   */
  public function setImages() {
    if (!empty($this->imagesData)) {
      foreach ($this->imagesData as $key => $image) {
        $this->images[$key]['@id'] = $image['image_uri'];
        $this->images[$key]['@type'] = 'oa:Annotation';
        $this->images[$key]['motivation'] = 'sc:Painting';/*$image->motivation*/;
        $this->images[$key]['on'] = $image['image_uri'];
        $this->images[$key]['resource']['@id'] = $image['image_uri'];
        $this->images[$key]['resource']['@type'] = 'dctypes:Image';
        $this->images[$key]['resource']['format'] = 'image/jpg';/*$this->image_format;*/
        $this->images[$key]['resource']['height'] = $image['image_height'];
        $this->images[$key]['resource']['height'] = $image['image_width'];
        $this->images[$key]['resource']['service']['@context'] = 'http://iiif.io/api/image/2/context.json';
        $this->images[$key]['resource']['service']['@id'] = $image['image_uri'];
        $this->images[$key]['resource']['service']['profile'] = 'http://iiif.io/api/image/2/level2.json';
      }
    }

  }

  /**
   * Creates the manifest canvas array.
   */
  public function toArray() {
    $manifest_canvas = array();
    foreach ($this->images as $key => $img) {
      $manifest_canvas[] = array(
      '@id' => $img['@id'],
      '@type' => 'sc:Canvas',
      'label' => $this->objectLabel,
      'height' => $this->maxImageHeight,
      'width' => $this->maxImageWidth,
      'thumbnail' => array(
        '@id' => $img['@id'],
        'service' => array(
          '@context' => 'http://iiif.io/api/image/2/context.json',
          '@id' => $img['@id'],
          'profile' => 'http://iiif.io/api/image/2/level2.json',
        ),
      ),
      'images' => array($img),
    );
    }
    return $manifest_canvas;
  }

}
