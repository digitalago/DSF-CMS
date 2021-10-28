<?php
/**
 * @file
 * Contains \Drupal\events\Plugin\Block\EventsCalendarBlock.
 */
namespace Drupal\events\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Events Calendar' block.
 *
 * @Block(
 *   id = "events_calendar_block",
 *   admin_label = @Translation("Events Calendar"),
 * )
 */
class EventsCalendarBlock extends BlockBase {


  /**
   * {@inheritdoc}
   */
  public function build() {
    $element = [];
    $element['#theme'] = 'events_calendar_block';
    $element['#attached'] = ['library' => ['events/events_switcher']];
    return $element;
  }
}
