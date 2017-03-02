<?php
/**
 * This is the template for generating a CRUD controller class file.
 */

use yii\helpers\StringHelper;


/* @var $this yii\web\View */
/* @var $generator dee\gii\generators\angular\Generator */

$controllerClass = StringHelper::basename($generator->getRestControllerClass());
$modelClass = StringHelper::basename($generator->modelClass);

$class = $generator->modelClass;
$pks = $class::primaryKey();

echo "<?php\n";
?>

namespace <?= StringHelper::dirname(ltrim($generator->getRestControllerClass(), '\\')) ?>;

use Yii;
use <?= ltrim($generator->baseRestControllerClass, '\\') ?>;

/**
 * <?= $controllerClass ?> implements the Rest controller for <?= $modelClass ?> model.
 */
class <?= $controllerClass ?> extends <?= StringHelper::basename($generator->baseRestControllerClass) . "\n" ?>
{

    public $modelClass = '<?= ltrim($generator->modelClass, '\\') ?>';
}
