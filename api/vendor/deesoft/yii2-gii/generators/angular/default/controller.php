<?php
/**
 * This is the template for generating a CRUD controller class file.
 */

use yii\helpers\StringHelper;


/* @var $this yii\web\View */
/* @var $generator dee\gii\generators\angular\Generator */

$controllerClass = StringHelper::basename($generator->getControllerClass());
$modelClass = StringHelper::basename($generator->modelClass);

$class = $generator->modelClass;
$pks = $class::primaryKey();

echo "<?php\n";
?>

namespace <?= StringHelper::dirname(ltrim($generator->getControllerClass(), '\\')) ?>;

use Yii;
use <?= ltrim($generator->baseControllerClass, '\\') ?>;

/**
 * <?= $controllerClass ?> implements the CRUD actions for <?= $modelClass ?> model.
 */
class <?= $controllerClass ?> extends <?= StringHelper::basename($generator->baseControllerClass) . "\n" ?>
{
    
    /**
     * Display main page.
     * @return mixed
     */
    public function actionIndex()
    {
        return $this->render('main');
    }
}
