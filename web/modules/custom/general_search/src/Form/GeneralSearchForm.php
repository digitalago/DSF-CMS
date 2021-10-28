<?php

namespace Drupal\general_search\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Base Search Form.
 */
class GeneralSearchForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'general_search_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['expand_search'] = [
      '#type' => 'item',
      '#title' => 'Search toggle',
      '#title_display' => 'none',
      '#markup' => '<a href="/"><span class="search-btn" aria-hidden="true"></span></a>',
    ];
    $form['search_wrapper'] = [
      '#type' => 'container',
      '#attributes' => [
        'class' => 'search-wrapper',
      ]
    ];
    $form['search_wrapper']['search_content'] = [
      '#type' => 'textfield',
      '#size' => 60,
      '#maxlength' => 128,
      '#title' => 'Search',
      '#attributes' => [
        'aria-label' => 'search',
      ]
    ];
    $form['search_wrapper']['collape_search'] = [
      '#type' => 'markup',
      '#markup' => '<a href="/" class="search-collapse"><span class="close-search-btn" aria-hidden="true"></span></a>'
    ];
    $form['actions']['search'] = [
      '#type' => 'submit',
      '#value' => $this->t('Search'),
      '#button_type' => 'primary',
      '#attributes' => [
        'class' => array('element-invisible'),
      ]
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    $path = Url::fromRoute('entity.node.canonical', ['node' => 4326, 'search' => $values['search_content'],]);
    $path = $path->toString();
    $response = new RedirectResponse($path);
    $response->send();
  }
}
