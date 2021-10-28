<?php

namespace Drupal\block_content\Plugin\Validation\Constraint;

use Drupal\Core\Validation\Plugin\Validation\Constraint\UniqueFieldConstraint;

/**
 * Checks if an block_content info field has a unique value.
 *
 * @Constraint(
 *   id = "UniqueBlockContentLabel",
 *   label = @Translation("Unique Block Content Label constraint", context = "Validation"),
 * )
 */
class UniqueBlockContentLabel extends UniqueFieldConstraint {

  /**
   * {@inheritdoc}
   */
  public function validatedBy() {
    return '\Drupal\block_content\Plugin\Validation\Constraint\UniqueBlockContentLabelValueValidator';
  }

}
