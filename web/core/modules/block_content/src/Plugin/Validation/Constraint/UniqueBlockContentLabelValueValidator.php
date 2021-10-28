<?php

namespace Drupal\block_content\Plugin\Validation\Constraint;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Validation\Plugin\Validation\Constraint\UniqueFieldValueValidator;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Validates that a BlockContent label is unique for all reusable blocks.
 */
class UniqueBlockContentLabelValueValidator extends UniqueFieldValueValidator {

  /**
   * @inheritDoc
   */
  public function initialize(ExecutionContextInterface $context) {
    $items = $context->getValue();
    /** @var \Drupal\Core\Entity\EntityInterface $entity */
    $entity = $items->getEntity();
    if ($entity->getEntityTypeId() !== 'block_content') {
      throw new \InvalidArgumentException("The UniqueBlockContentLabelValueValidator can only be used with entities of the type block_content. {$entity->getEntityTypeId()} provided");
    }
    parent::initialize($context);
  }

  /**
   * {@inheritdoc}
   */
  public function validate($items, Constraint $constraint) {
    /** @var \Drupal\Core\Entity\EntityInterface $entity */
    $entity = $items->getEntity();

    // Validate only if block is reusable.
    if (!$entity->isReusable()) {
      return;
    }

    parent::validate($items, $constraint);
  }

  /**
   * @inheritDoc
   */
  protected function getEntityQuery(FieldItemListInterface $items) {
    $query = parent::getEntityQuery($items);
    $query->condition('reusable', 1);
    return $query;
  }


}
