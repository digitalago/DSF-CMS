<?php

/**
 * @file
 * Contains \Drupal\menu\Plugin\Block\MainMenuBlock.
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
 * Provides a 'Main menu' block.
 *
 * @Block(
 *   id = "main_menu",
 *   admin_label = @Translation("Main menu")
 * )
 */
class MainMenuBlock extends BlockBase implements ContainerFactoryPluginInterface {
  /**
   * Constructs a new MainMenuBlock instance.
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
    // Menu block.
    $menu = \Drupal\block\Entity\Block::load('de_theme_main_menu');
    $menu_content = \Drupal::entityTypeManager()
      ->getViewBuilder('block')
      ->view($menu);
    $element['#theme'] = 'main_menu_block';
    $element['#menu_block'] = $menu_content;
    // // Btns.
    // $btns['#type'] = 'markup';
    // $btns['#markup'] = '<a class="btn" href="https://tickets.ago.ca">' . $this->t('Book Tickets') . '</a><a class="search-btn btn" href="/search-results">' . $this->t('Search') . '</a>';
    // $element['#btns'] = $btns;
    $element['#attached'] = array('library' => 'menu/main_menu');
    return $element;
  }
}
