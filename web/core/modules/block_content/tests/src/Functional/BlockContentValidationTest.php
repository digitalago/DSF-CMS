<?php

namespace Drupal\Tests\block_content\Functional;

use Drupal\Component\Render\FormattableMarkup;

/**
 * Tests block content validation constraints.
 *
 * @group block_content
 */
class BlockContentValidationTest extends BlockContentTestBase {

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * Tests the block content validation constraints.
   */
  public function testValidation() {
    // Add a block.
    $description = $this->randomMachineName();
    $block = $this->createBlockContent($description, 'basic');
    // Validate the block.
    $violations = $block->validate();
    // Make sure we have no violations.
    $this->assertEqual(count($violations), 0);
    // Save the block.
    $block->save();

    // Add another block with the same description.
    $block = $this->createBlockContent($description, 'basic');
    // Validate this block.
    $violations = $block->validate();
    // Make sure we have 1 violation.
    $this->assertEqual(count($violations), 1);
    // Make sure the violation is on the info property
    $this->assertEqual($violations[0]->getPropertyPath(), 'info');
    // Make sure the message is correct.
    $this->assertEqual($violations[0]->getMessage(), new FormattableMarkup('A custom block with block description %value already exists.', [
      '%value' => $block->label(),
    ]));
  }

  /**
   * Tests block label validation.
   */
  public function testLabelValidation() {
    $block = $this->createBlockContent('foo', 'basic');
    $block->setNonReusable();
    $block->save();

    $block2 = $this->createBlockContent('foo', 'basic');

    $violations = $block2->validate();
    // Make sure we have no violations.
    $this->assertCount(0, $violations);

    $block2->save();

    $block3 = $this->createBlockContent('foo', 'basic');
    $violations = $block3->validate();
    // Make sure we have 1 violation.
    $this->assertCount(1, $violations);
    $this->assertEquals('info', $violations[0]->getPropertyPath());
  }

}
