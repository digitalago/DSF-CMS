<?php
/**
 * @file
 * Contains \Drupal\collection_blocks\Form\TopCollectionSearchForm.
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
class TopCollectionSearchForm extends FormBase {
  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'top_collection_search_block_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    $form['search-wrapper'] = array(
      '#type' => 'container',
      '#attributes' => array(
        'class' => 'search-wrap',
      ),
    );

    $form['search-wrapper']['keys'] = array(
      '#type'           => 'search',
      '#title'          => $this->t('Search'),
      '#title_display'  => 'invisible',
      '#size'           => 15,
      '#maxlength'      => 128,
      '#default_value'  => '',
      '#placeholder'    => $this->t('Search the Collection'),
      '#attributes'     => array(
        'class' => array('collection-search'),
      ),
    );
    $form['search-wrapper']['actions'] = array('#type' => 'actions');
    $form['search-wrapper']['actions']['submit'] = array(
      '#type'   => 'submit',
      '#value'  => $this->t('Search'),
      '#button_type' => 'primary',
    );
    $form['browse-wrapper'] = array(
      '#type' => 'container',
      '#attributes' => array(
        'class' => 'browse-wrap',
      ),
    );

    $form['browse-wrapper']['browse'] = array(
      '#type'   => 'submit',
      '#value'  => $this->t('Browse the collection'),
      '#weight' => 100,
      '#button_type' => 'secondary',
    );
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
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
      $url = Url::fromRoute($route, array('keys' => $keys,));
      $form_state->setRedirectUrl($url);
    }
    else {
      $url = Url::fromRoute($route);
      $form_state->setRedirectUrl($url);
    }
  }
}
