<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace dee\gii\generators\angular;

use Yii;
use yii\web\Controller;
use yii\gii\CodeFile;

/**
 * Generates CRUD
 *
 * @property string $controllerClass The controller class to be generated. This property is
 * read-only.
 *
 * @author Misbahul D Munir <misbahuldmunir@gmail.com>
 */
class Generator extends \dee\gii\generators\crud\Generator
{
    public $restControllerID;
    public $baseRestControllerClass = 'yii\rest\ActiveController';
    public $prefixRoute;

    /**
     * @inheritdoc
     */
    public function getName()
    {
        return 'Angular CRUD Generator';
    }

    /**
     * @inheritdoc
     */
    public function getDescription()
    {
        return 'This generator generates a controller and views that implement CRUD (Create, Read, Update, Delete)
            operations for the specified data model.';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return array_merge(parent::rules(), [
            [['restControllerID', 'prefixRoute', 'baseControllerClass'], 'trim'],
            [['restControllerID', 'prefixRoute'], 'match', 'pattern' => '/^[a-z][a-z0-9\\-\\/]*$/', 'message' => 'Only a-z, 0-9, dashes (-) and slashes (/) are allowed.'],
            [['baseControllerClass'], 'match', 'pattern' => '/^[\w\\\\]*$/', 'message' => 'Only word characters and backslashes are allowed.'],
            [['baseControllerClass'], 'validateClass', 'params' => ['extends' => Controller::className()]],

        ]);
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return array_merge(parent::attributeLabels(), [
            'restControllerID' => 'Rest Controller ID',
            'prefixRoute' => 'Prefix Route'
        ]);
    }

    /**
     * @inheritdoc
     */
    public function hints()
    {
        return array_merge(parent::hints(), [
            'restControllerID' => 'Controller ID should be in lower case and may contain module ID(s) separated by slashes. For example:
                <ul>
                    <li><code>order</code> generates <code>OrderController.php</code></li>
                    <li><code>order-item</code> generates <code>OrderItemController.php</code></li>
                    <li><code>admin/user</code> generates <code>UserController.php</code> under <code>admin</code> directory.</li>
                </ul>',
        ]);
    }

    /**
     * @inheritdoc
     */
    public function generate()
    {
        $controllerFile = Yii::getAlias('@' . str_replace('\\', '/', ltrim($this->getControllerClass(), '\\')) . '.php');

        $files = [
            new CodeFile($controllerFile, $this->render('controller.php')),
        ];

        $viewPath = $this->getViewPath();
        $templatePath = $this->getTemplatePath() . '/views';
        foreach (scandir($templatePath) as $file) {
            if (is_file($templatePath . '/' . $file) && pathinfo($file, PATHINFO_EXTENSION) === 'php') {
                $files[] = new CodeFile("$viewPath/$file", $this->render("views/$file"));
            }
        }
        $templatePath = $this->getTemplatePath() . '/views/js';
        foreach (scandir($templatePath) as $file) {
            if (is_file($templatePath . '/' . $file) && pathinfo($file, PATHINFO_EXTENSION) === 'php') {
                $jsFile = substr($file, 0, -4);
                $files[] = new CodeFile("$viewPath/js/$jsFile", $this->render("views/js/$file"));
            }
        }

        if (!empty($this->restControllerID)) {
            $restControllerFile = Yii::getAlias('@' . str_replace('\\', '/', ltrim($this->getRestControllerClass(), '\\')) . '.php');
            $files[] = new CodeFile($restControllerFile, $this->render('restController.php'));
        }

        return $files;
    }
    private $_restControllerClass;

    /**
     * @return string the controller class
     */
    public function getRestControllerClass()
    {
        if ($this->_restControllerClass === null) {
            $module = Yii::$app;
            $id = $this->restControllerID;
            while (($pos = strpos($id, '/')) !== false) {
                $mId = substr($id, 0, $pos);
                if (($m = $module->getModule($mId)) !== null) {
                    $module = $m;
                    $id = substr($id, $pos + 1);
                } else {
                    break;
                }
            }

            $pos = strrpos($id, '/');
            if ($pos === false) {
                $prefix = '';
                $className = $id;
            } else {
                $prefix = substr($id, 0, $pos + 1);
                $className = substr($id, $pos + 1);
            }

            $className = str_replace(' ', '', ucwords(str_replace('-', ' ', $className))) . 'Controller';
            $className = ltrim($module->controllerNamespace . '\\' . str_replace('/', '\\', $prefix) . $className, '\\');
            $this->_restControllerClass = $className;
        }
        return $this->_restControllerClass;
    }
}