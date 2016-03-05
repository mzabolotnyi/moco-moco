<?php

namespace app\models;

/**
 * Searchable is the interface that should be implemented by classes that typically represent locatable resources.
 */
interface ISearchable
{
    /**
     * Returns ActiveDataProvider with applying filters
     * @param array $params filtering
     * @return mixed
     */
    public static function search($params);
}
