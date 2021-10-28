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
 * Provides a 'Mobile menu' block.
 *
 * @Block(
 *   id = "mobile_menu",
 *   admin_label = @Translation("Mobile menu")
 * )
 */
class MobileMenuBlock extends BlockBase implements ContainerFactoryPluginInterface {
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
    // Menu block.
    $menu = \Drupal\block\Entity\Block::load('main_nav_mobile');
    $menu_content = \Drupal::entityTypeManager()
      ->getViewBuilder('block')
      ->view($menu);
    $element['#theme'] = 'mobile_menu_block';
    $element['#menu_block'] = $menu_content;
    // Header.
    $header['#type'] = 'markup';
    $header['#markup'] = '<img src="/themes/custom/de_theme/logo.svg" alt="AGO Logo"><span class="ago-title">' . $this->t('Art Gallery of Ontario') . '</span><div class="menu-close">' . $this->t('Menu') . '</div>';
    $element['#header'] = $header;
    // Btns.
    $btns['#type'] = 'markup';
    $btns['#markup'] = '<a class="btn" href="https://tickets.ago.ca">' . $this->t('Book Your Visit') . '</a><a class="search-btn btn" href="/search-results">' . $this->t('Search') . '</a>';
    $element['#btns'] = $btns;
    // Subsite menu.
    $subsite_menu = \Drupal\block\Entity\Block::load('subsitemenu');
    $subsite_menu_content = \Drupal::entityTypeManager()
      ->getViewBuilder('block')
      ->view($subsite_menu);
    $element['#subsite_menu'] = $subsite_menu_content;
    return $element;
  }
}
