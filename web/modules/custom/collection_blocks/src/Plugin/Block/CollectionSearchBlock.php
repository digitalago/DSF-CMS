<?php

/**
 * @file
 * Contains \Drupal\collection_blocks\Plugin\Block\CollectionSearchBlock.
 */

namespace Drupal\collection_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Access\AccessResult;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Language\Language;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StreamWrapper\PublicStream;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'Collection search' block.
 *
 * @Block(
 *   id = "collection_search_block",
 *   category = @Translation("Forms"),
 *   admin_label = @Translation("Collection Search Form Block")
 * )
 */
class CollectionSearchBlock extends BlockBase implements ContainerFactoryPluginInterface {
  /**
   * Constructs a new CollectionSearchBlock instance.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    return \Drupal::formBuilder()->getForm('Drupal\collection_blocks\Form\CollectionSearchForm', $this->configuration);
  }
}
