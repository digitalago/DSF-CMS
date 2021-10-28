<?php

/**
 * @file
 * Contains \Drupal\menu\Plugin\Block\MobileMenuBlock.
 */

namespace Drupal\menu\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Access\AccessResult;
use Drupal\Core\Language\Language;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StreamWrapper\PublicStream;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'Mobile menu toggle' block.
 *
 * @Block(
 *   id = "mobile_menu_toggle",
 *   admin_label = @Translation("Mobile menu toggle")
 * )
 */
class MobileMenuToggleBlock extends BlockBase implements ContainerFactoryPluginInterface {
  /**
   * Constructs a new MobileMenuBlock instance.
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
    $element = array();
    $element['#theme'] = 'mobile_menu_toggle_block';
    $element['#attached'] = array('library' => 'menu/menu');
    return $element;
  }
}
