<?php

namespace app\models;

use yii\base\Model;
use Yii;
use yii\helpers\Url;

/**
 * Модель регистрации пользователя
 */
class UserSignup extends Model
{
    public $username;
    public $email;
    public $password;

    private $_user = false;

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'username' => 'Имя пользователя',
            'email' => 'Email',
            'password' => 'Пароль',
        ];
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['username', 'filter', 'filter' => 'trim'],
            ['username', 'required', 'message' => 'Не указано имя пользователя'],
            ['username', 'string', 'min' => 2, 'max' => 255],

            ['email', 'filter', 'filter' => 'trim'],
            ['email', 'required', 'message' => 'Не указан Email'],
            ['email', 'email', 'message' => 'Неверный формат Email'],
            ['email', 'string', 'min' => 2, 'max' => 255],
            ['email', 'unique', 'targetClass' => '\app\models\User', 'message' => 'Email уже используется'],

            ['password', 'required', 'message' => 'Не указан пароль'],
            ['password', 'string', 'min' => 6, 'max' => 255],
        ];
    }

    /**
     * Выполняет регистрацию нового пользователя
     * при этом отправляет на email ссылку для подтверждения регистрации
     * если не удалось отправить ссылку на подтверждение (считаем это проблемой сервера)
     * активируем пользования без подтверждения email
     *
     * @return bool
     */
    public function signup()
    {
        if ($this->validate()) {
            $user = new User();
            $user->username = $this->username;
            $user->email = $this->email;
            $user->status = $user::STATUS_ACTIVE;
            $user->setPassword($this->password);
            $user->generateAuthKey();
            if ($user->save()) {
                $this->_user = $user;
                $this->sendRegistrationMail();
                $this->performInitialFilling();
                return true;
            }
        }

        return false;
    }

    /**
     * Sends email letter about successful registration
     * @return bool
     */
    protected function sendRegistrationMail()
    {
        return Yii::$app->mailer
            ->compose('@app/mail/successSignup.php', [
                'username' => $this->getUser()->username,
                'email' => $this->getUser()->email,
                'serviceUrl' => Yii::$app->params['serviceUrl'],
            ])
            ->setFrom([Yii::$app->params['supportEmail'] => Yii::$app->name])
            ->setTo($this->getUser()->email)
            ->setSubject('Регистрация')
            ->send();
    }

    /**
     * Performs initial filling for registered user
     */
    protected function performInitialFilling()
    {
        $this->getUser()->createProfile();
        $this->createDefaultTags();
        $this->createDefaultAccount();
    }

    protected function createDefaultTags()
    {
        $userId = $this->getUser()->id;

        $tagsData = [
            ['name' => 'Зарплата', 'icon' => 'fa-money', 'user_id' => $userId, 'active' => true, 'income' => true, 'expense' => false],
            ['name' => 'Премия', 'icon' => 'fa-usd', 'user_id' => $userId, 'active' => true, 'income' => true, 'expense' => false],
            ['name' => 'Дополнительный доход', 'icon' => 'fa-plus-circle', 'user_id' => $userId, 'active' => true, 'income' => true, 'expense' => false],
            ['name' => 'Стипендия', 'icon' => 'fa-university', 'user_id' => $userId, 'active' => true, 'income' => true, 'expense' => false],
            ['name' => 'Автомобиль', 'icon' => 'fa-car', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Фриланс', 'icon' => 'fa-briefcase', 'user_id' => $userId, 'active' => true, 'income' => true, 'expense' => false],
            ['name' => 'Помощь, подарки', 'icon' => 'fa-gift', 'user_id' => $userId, 'active' => true, 'income' => true, 'expense' => true],
            ['name' => 'Гаджеты', 'icon' => 'fa-tablet', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Бытовая техника', 'icon' => 'fa-television', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Домашние животные', 'icon' => 'fa-paw', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Здоровье и красота', 'icon' => 'fa-user-md', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Ипотека, долги, кредиты', 'icon' => 'fa-credit-card', 'user_id' => $userId, 'active' => true, 'income' => true, 'expense' => true],
            ['name' => 'Квартира и связь', 'icon' => 'fa-lightbulb-o', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Налоги и страхование', 'icon' => 'fa-umbrella', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Образование ', 'icon' => 'fa-graduation-cap', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Одежда и аксессуары', 'icon' => 'fa-female', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Отдых и развлечение', 'icon' => 'fa-headphones', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Питание', 'icon' => 'fa-shopping-cart', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Разное', 'icon' => 'fa-thumb-tack', 'user_id' => $userId, 'active' => true, 'income' => true, 'expense' => true],
            ['name' => 'Ремонт и мебель', 'icon' => 'fa-bed', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Товары для дома', 'icon' => 'fa-home', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Транспорт', 'icon' => 'fa-bus', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Хобби', 'icon' => 'fa-paint-brush', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
            ['name' => 'Аренда квартиры', 'icon' => 'fa-home', 'user_id' => $userId, 'active' => true, 'income' => true, 'expense' => false],
            ['name' => 'Услуги', 'icon' => 'fa-briefcase', 'user_id' => $userId, 'active' => true, 'income' => false, 'expense' => true],
        ];

        foreach ($tagsData as $tagData) {
            $tag = new Tag();
            $tag->load($tagData, '');
            $tag->user_id = $tagData['user_id'];
            $tag->save();
        }
    }

    protected function createDefaultAccount()
    {
        $account = new Account();
        $account->name = 'Наличные';
        $account->user_id = $this->getUser()->id;

        return $account->save();
    }

    /**
     * Возвращает пользователя, найденного по email
     *
     * @return User|null
     */
    public function getUser()
    {
        if ($this->_user === false) {
            $this->_user = User::findByEmail($this->email);
        }

        return $this->_user;
    }
}
