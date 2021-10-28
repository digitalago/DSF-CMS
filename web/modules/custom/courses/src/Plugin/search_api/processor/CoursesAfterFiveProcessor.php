<?php

namespace Drupal\courses\Plugin\search_api\processor;

use Drupal\search_api\Datasource\DatasourceInterface;
use Drupal\search_api\Item\ItemInterface;
use Drupal\search_api\Processor\ProcessorPluginBase;
use Drupal\search_api\Processor\ProcessorProperty;
use Drupal\Core\Database\Database;

/**
 * Adds Courses Property.
 *
 * @SearchApiProcessor(
 *   id = "courses_after_five",
 *   label = @Translation("Courses after Five"),
 *   description = @Translation("Adds courses after five property."),
 *   stages = {
 *     "add_properties" = 0,
 *   },
 *   locked = true,
 *   hidden = true,
 * )
 */
class CoursesAfterFiveProcessor extends ProcessorPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getPropertyDefinitions(DatasourceInterface $datasource = NULL) {
    $properties = [];

    if (!$datasource) {
      $definition = [
        'label' => $this->t('Courses After Five'),
        'description' => $this->t('Courses after five property.'),
        'type' => 'boolean',
        'processor_id' => $this->getPluginId(),
      ];
      $properties['courses_after_five'] = new ProcessorProperty($definition);
    }

    return $properties;
  }

  /**
   * {@inheritdoc}
   */
  public function addFieldValues(ItemInterface $item) {
    $id = $item->getDatasource()->getItemId($item->getOriginalObject());
    if (!empty($id)) {
      $id = explode(':', $id);
      $id = reset($id);
    }
    $node = \Drupal::entityTypeManager()->getStorage('node')->load($id);
    $db = Database::getConnection('default', 'default');
    $query = $db->select('node', 'n');
    $query->join('node__field_course_section', 'section', 'section.entity_id = n.nid');
    $query->join('node__field_start_time', 'time', 'time.entity_id = section.field_course_section_target_id');
    $query->condition('n.nid', $id);
    $query->fields('time', ['field_start_time_value',]);
    $query->condition('n.type', 'course');
    $res = $query->execute()->fetchAll();
    $fields = $item->getFields(FALSE);
    $fields = $this->getFieldsHelper()
      ->filterForPropertyPath($fields, NULL, 'courses_after_five');
    $after_five_keys = [34, 47];
    if (!empty($fields)) {
      foreach ($fields as $field) {
        if (!empty($res)) {
          foreach ($res as $r) {
            if ($r->field_start_time_value >= 34 && $r->field_start_time_value <= 47) {
              $field->addValue(TRUE);
            }
            else {
              $field->addValue(FALSE);
            }
          }
        }
      }
    }
  }

}
