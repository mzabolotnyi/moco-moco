<?php

namespace app\commands;

use app\models\User;
use yii\console\Controller;
use yii\rbac\DbManager;

/**
 * Used for creating RBAC structure
 */
class RbacController extends Controller
{
    /**
     * Action initiates creation of roles and permissions, and generates structure of theirs relations
     */
    public function actionInit()
    {
        // get authManager
        $authManager = new DbManager();

        // clear current structure
        $authManager->removeAllPermissions();
        $authManager->removeAllRoles();
        $authManager->removeAllRules();

        // create roles
        $roleBasic = $authManager->createRole(User::ROLE_BASIC);
        $rolePremium = $authManager->createRole(User::ROLE_PREMIUM);
        $roleAdmin = $authManager->createRole(User::ROLE_ADMIN);

        // add roles
        $authManager->add($roleBasic);
        $authManager->add($rolePremium);
        $authManager->add($roleAdmin);

        // create permissions
        $permissionOperateSelf = $authManager->createPermission('operateSelf');
        $permissionOperateAll = $authManager->createPermission('operateAll');

        // add permissions
        $authManager->add($permissionOperateSelf);
        $authManager->add($permissionOperateAll);

        // GENERATE RBAC RELATIONS

        // role "Basic" has permission to operate whit own objects
        $authManager->addChild($roleBasic, $permissionOperateSelf);

        // role "Premium" has all permissions of role "Basic"
        $authManager->addChild($rolePremium, $roleBasic);

        // role "Admin" has all permissions of role "Premium" and can operate with all objects
        $authManager->addChild($roleAdmin, $rolePremium);
        $authManager->addChild($roleAdmin, $permissionOperateAll);

        // assing role "Admin" to user with ID 1
        // $authManager->assign($roleAdmin, 1);
    }
}
