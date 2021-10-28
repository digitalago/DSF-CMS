<?php
/**
 * @file
 * Contains \Drupal\collection_blocks\Form\CollectionSearchForm.
 */

namespace Drupal\collection_blocks\Form;

use Drupal\Component\Utility\SafeMarkup;
use Drupal\Component\Utility\Unicode;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Language\Language;
use Drupal\Core\Render\Element;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Builds the search form for the search block.
 */
class CollectionSearchForm extends FormBase {
  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'collection_search_block_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['browse'] = array(
      '#type' => 'submit',
      '#value' => $this->t('Browse the collection'),
      '#weight' => -100,
      '#button_type' => 'secondary',
    );
    $form['search-wrapper'] = array(
      '#type' => 'container',
      '#attributes' => array(
        'class' => 'search-wrap',
      ),
    );
    $form['search-wrapper']['keys'] = array(
      '#type' => 'search',
      '#title' => $this->t('Search'),
      '#title_display' => 'invisible',
      '#size' => 15,
      '#maxlength' => 128,
      '#default_value' => '',
      '#placeholder' => $this->t('Search the Collection'),
      '#attributes' => array(
        'class' => array('collection-search'),
      ),
    );
    $form['search-wrapper']['collection_reference'] = array(
      '#type' => 'hidden',
      '#default_value' => 0,
      '#attributes' => array('class' => array('collection-reference')),
    );
    $form['search-wrapper']['actions'] = array('#type' => 'actions');
    $form['search-wrapper']['actions']['submit'] = array(
      '#type' => 'submit',
      '#value' => $this->t('Search'),
      '#button_type' => 'primary',
    );
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $node_current = \Drupal::routeMatch()->getParameter('node');
    if (isset($node_current) && is_object($node_current) && isset($node_current->field_global_collection_ref)) {
      $ref = $node_current->field_global_collection_ref->getValue();
      if (isset($ref[0]['target_id'])) {
        $collection = $ref[0]['target_id'];
      }
      else {
        $collection = $form_state->getValue('collection_reference');
      }

    }
    else {
      $collection = $form_state->getValue('collection_reference');
    }
    $route = 'view.collection_search.collection_browse_page';
    $tr = $form_state->getTriggeringElement();
    if (isset($tr['#value'])) {
      $operation = $form_state->getTriggeringElement()['#value']->__toString();
    }
    else {
      $operation = 'Search';
    }
    if (isset($operation) && $operation === 'Search') {
      $keys = trim($form_state->getValue('keys'));
      $url = Url::fromRoute($route, array(
        'keys' => $keys,
        'collection[' . $collection . ']' => $collection,
      ));
      $form_state->setRedirectUrl($url);
    }
    else {
      $url = Url::fromRoute($route, array('collection[' . $collection . ']' => $collection,));
      $form_state->setRedirectUrl($url);
    }
  }
}
