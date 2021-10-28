<?php

namespace Drupal\render_block_formatter\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\block_content\Entity\BlockContent;

/**
 * Plugin implementation of the 'block_field_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "render_block",
 *   label = @Translation("Render Block Formatter"),
 *   field_types = {
 *     "entity_reference"
 *   }
 * )
 */
class RenderBlockFormatter extends FormatterBase implements ContainerFactoryPluginInterface {

  /**
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * Constructs an ImageFormatter object.
   *
   * @param string $plugin_id
   *   The plugin_id for the formatter.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Field\FieldDefinitionInterface $field_definition
   *   The definition of the field to which the formatter is associated.
   * @param array $settings
   *   The formatter settings.
   * @param string $label
   *   The formatter label display setting.
   * @param \Drupal\Core\Session\AccountInterface $current_user
   *   The current user.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer service.
   */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, $label, $view_mode, array $third_party_settings, AccountInterface $current_user, RendererInterface $renderer) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $label, $view_mode, $third_party_settings);
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['label'],
      $configuration['view_mode'],
      $configuration['third_party_settings'],
      $container->get('current_user'),
      $container->get('renderer')
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      // Implement default settings.
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    return [
      // Implement settings form.
    ] + parent::settingsForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    // Implement settings summary.
    return $summary;
  }


  /**
   * {@inheritdoc}
   */
   public function viewElements(FieldItemListInterface $items, $langcode) {
     $elements = [];
     foreach ($items as $delta => $item) {
       $block_id = $item->getValue()['target_id'];
       $block = BlockContent::load($block_id);
       if ($block) {
         if($block->hasField('field_view_mode')) {
           $view_mode = $block->get('field_view_mode')->getString();
           $content = \Drupal::entityTypeManager()->getViewBuilder('block_content')->view($block, $view_mode);
         }
         else {
           $content = \Drupal::entityTypeManager()->getViewBuilder('block_content')->view($block);
         }
         $build = [
           '#theme' => 'block',
           '#configuration' => [
             'label' => $block->get('info')->value,
             'label_display' => 'visible',
             'provider' => 'block_content',
           ],
           '#base_plugin_id' => 'block_content',
           '#plugin_id' => 'block_content:' . $block->uuid(),
           '#derivative_plugin_id' => $block->uuid(),
           '#id' => $block->id(),
           'content' => $content,
         ];
         $elements[$delta] = $build;
       }
     }
     return $elements;
   }

}
