<?php

namespace Drupal\ago_content_migration\Plugin\migrate\process;

use Drupal\Core\File\FileSystemInterface;
use Drupal\migrate\MigrateException;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;
use Drupal\migrate\Plugin\migrate\process\FileCopy;

/**
 * Copies or download a local file from one place into another.
 *
 * @MigrateProcessPlugin(
 *   id = "custom_file_copy"
 * )
 */
class CustomFileCopy extends FileCopy {

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    // If we're stubbing a file entity, return a URI of NULL so it will get
    // stubbed by the general process.
    if ($row->isStub()) {
      return NULL;
    }
    list($source, $destination) = $value;

    // If the source path or URI represents a remote resource, delegate to the
    // download plugin.
    if (!$this->isLocalUri($source)) {
      return $this->downloadPlugin->transform($value, $migrate_executable, $row, $destination_property);
    }

    // Ensure the source file exists, if it's a local URI or path.
    if (!file_exists($source)) {
      // If file can't be found, try to download it from prod.
      $ext_source = str_replace('public://migration_files/', 'https://ago.ca/sites/default/files/', $source);
      $ext_value = [
        $ext_source,
        $destination,
      ];
      return $this->downloadPlugin->transform(
        $ext_value,
        $migrate_executable,
        $row,
        $destination_property
      );
    }

    // If the start and end file is exactly the same, there is nothing to do.
    if ($this->isLocationUnchanged($source, $destination)) {
      return $destination;
    }

    // Check if a writable directory exists, and if not try to create it.
    $dir = $this->getDirectory($destination);
    // If the directory exists and is writable, avoid
    // \Drupal\Core\File\FileSystemInterface::prepareDirectory() call and write
    // the file to destination.
    if (!is_dir($dir) || !is_writable($dir)) {
      if (!$this->fileSystem->prepareDirectory($dir, FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS)) {
        throw new MigrateException("Could not create or write to directory '$dir'");
      }
    }

    $final_destination = $this->writeFile($source, $destination, $this->configuration['file_exists']);
    if ($final_destination) {
      return $final_destination;
    }
    throw new MigrateException("File $source could not be copied to $destination");
  }

}
