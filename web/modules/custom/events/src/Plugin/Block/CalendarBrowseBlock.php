<?php
/**
 * @file
 * Contains \Drupal\events\Plugin\Block\CalendarBrowseBlock.
 */
namespace Drupal\events\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Calendar Browse' block.
 *
 * @Block(
 *   id = "calendar_browse_block",
 *   admin_label = @Translation("Calendar Browse"),
 * )
 */
class CalendarBrowseBlock extends BlockBase {


  /**
   * {@inheritdoc}
   */
  public function build() {
    $element = [];
    $element['#theme'] = 'calendar_browse_block';
    $element['#attached'] = ['library' => ['events/events']];
    return $element;
  }
}
