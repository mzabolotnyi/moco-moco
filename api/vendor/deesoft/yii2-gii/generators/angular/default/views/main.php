<?php
/**
 * This is the template for generating a CRUD controller class file.
 */

use yii\helpers\StringHelper;

/* @var $this yii\web\View */
/* @var $generator dee\gii\generators\angular\Generator */

$restName = StringHelper::basename($generator->modelClass);
$resourceUrl = '/' . (empty($generator->restControllerID) ? $restName : $generator->restControllerID);
$prefixRoute = empty($generator->prefixRoute) ? '' : trim($generator->prefixRoute, '/') . '/';

echo "<?php\n";
?>
use yii\helpers\Url;
use dee\angular\NgView;

/* @var $this yii\web\View */
?>
<?php echo "<?=\n" ?>
NgView::widget([
    'requires' => ['ngResource','ui.bootstrap','dee.ui'],
    'routes' => [
        '/<?= $prefixRoute; ?>' => [
            'view' => 'index',
            'js' => 'js/index.js',
            'injection' => ['<?= $restName;?>',],
        ],
        '/<?= $prefixRoute; ?>create' => [
            'view' => 'create',
            'js' => 'js/create.js',
            'injection' => ['<?= $restName;?>',],
        ],
        '/<?= $prefixRoute; ?>:id/edit' => [
            'view' => 'update',
            'js' => 'js/update.js',
            'injection' => ['<?= $restName;?>',],
        ],
        '/<?= $prefixRoute; ?>:id' => [
            'view' => 'view',
            'js' => 'js/view.js',
            'injection' => ['<?= $restName;?>',],
        ],
    ],
    'resources' => [
        '<?= $restName;?>' => [
        'url' => '<?= rtrim(Yii::$app->homeUrl,'/')."{$resourceUrl}/:id"?>',
            'actions' =>[
                'update' => [
                    'method' => 'PUT',
                ],
            ]
        ]
    ], 
]);?>
