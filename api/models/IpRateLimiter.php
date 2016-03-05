<?php
namespace app\models;

use Yii;
use yii\base\Model;
use yii\filters\RateLimitInterface;

/**
 * Class for implementation the rate limiting for unique IP-address
 */
class IpRateLimiter extends Model implements RateLimitInterface
{
    /**
     * Returns client's IP that send request
     * @return string
     */
    public function getIp()
    {
        return Yii::$app->request->getUserIP();
    }

    /**
     * @inheritdoc
     */
    public function getRateLimit($request, $action)
    {
        return [60, 180]; //не более 60 запросов в течении 180 секунд (3 минут)
    }

    /**
     * @inheritdoc
     */
    public function loadAllowance($request, $action)
    {
        //get allowance from cache
        $cache = Yii::$app->cache;

        if ($cache) {
            $key = 'rate_limit_ip_' . $this->getIp();
            $allowance = $cache->get($key);

            if ($allowance) {
                return $allowance;
            }
        }

        //something wrong with cache - allow request
        return [1, time()];
    }

    /**
     * @inheritdoc
     */
    public function saveAllowance($request, $action, $allowance, $timestamp)
    {
        //set allowance to cache
        $cache = Yii::$app->cache;

        if ($cache) {
            $key = 'rate_limit_ip_' . $this->getIp();
            $cache->set($key, [
                $allowance,
                $timestamp,
            ]);
        }
    }

}
