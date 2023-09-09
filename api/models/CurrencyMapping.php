<?php

namespace app\models;

class CurrencyMapping
{
    const NUMBER_TO_CODE = [
        '004' => 'AFN', // Afghan Afghani
        '008' => 'ALL', // Albanian Lek
        '012' => 'DZD', // Algerian Dinar
        '032' => 'ARS', // Argentine Peso
        '036' => 'AUD', // Australian Dollar
        '044' => 'BSD', // Bahamian Dollar
        '048' => 'BHD', // Bahraini Dinar
        '050' => 'BDT', // Bangladeshi Taka
        '052' => 'BBD', // Barbadian Dollar
        '060' => 'BMD', // Bermudian Dollar
        '064' => 'BTN', // Bhutanese Ngultrum
        '068' => 'BOB', // Bolivian Boliviano
        '076' => 'BRL', // Brazilian Real
        '084' => 'BZD', // Belize Dollar
        '096' => 'BND', // Brunei Dollar
        '100' => 'BGN', // Bulgarian Lev
        '124' => 'CAD', // Canadian Dollar
        '132' => 'CVE', // Cape Verdean Escudo
        '152' => 'CLP', // Chilean Peso
        '156' => 'CNY', // Chinese Yuan
        '170' => 'COP', // Colombian Peso
        '174' => 'KMF', // Comorian Franc
        '188' => 'CRC', // Costa Rican Colón
        '191' => 'HRK', // Croatian Kuna
        '203' => 'CUP', // Cuban Peso
        '208' => 'DKK', // Danish Krone
        '214' => 'DOP', // Dominican Peso
        '818' => 'EGP', // Egyptian Pound
        '222' => 'SVC', // Salvadoran Colón
        '230' => 'ETB', // Ethiopian Birr
        '978' => 'EUR', // Euro
        '242' => 'FJD', // Fijian Dollar
        '826' => 'GBP', // British Pound Sterling
        '270' => 'GMD', // Gambian Dalasi
        '320' => 'GTQ', // Guatemalan Quetzal
        '328' => 'GYD', // Guyanese Dollar
        '344' => 'HKD', // Hong Kong Dollar
        '340' => 'HNL', // Honduran Lempira
        '348' => 'HUF', // Hungarian Forint
        '352' => 'ISK', // Icelandic Króna
        '356' => 'INR', // Indian Rupee
        '360' => 'IDR', // Indonesian Rupiah
        '364' => 'IRR', // Iranian Rial
        '368' => 'IQD', // Iraqi Dinar
        '376' => 'ILS', // Israeli New Shekel
        '388' => 'JMD', // Jamaican Dollar
        '392' => 'JPY', // Japanese Yen
        '400' => 'JOD', // Jordanian Dinar
        '404' => 'KES', // Kenyan Shilling
        '408' => 'KPW', // North Korean Won
        '410' => 'KRW', // South Korean Won
        '414' => 'KWD', // Kuwaiti Dinar
        '417' => 'KGS', // Kyrgystani Som
        '418' => 'LAK', // Lao Kip
        '422' => 'LBP', // Lebanese Pound
        '144' => 'LKR', // Sri Lankan Rupee
        '430' => 'LRD', // Liberian Dollar
        '426' => 'LSL', // Lesotho Loti
        '434' => 'LYD', // Libyan Dinar
        '504' => 'MAD', // Moroccan Dirham
        '498' => 'MDL', // Moldovan Leu
        '969' => 'MGA', // Malagasy Ariary
        '807' => 'MKD', // Macedonian Denar
        '104' => 'MMK', // Myanma Kyat
        '496' => 'MNT', // Mongolian Tugrik
        '478' => 'MRO', // Mauritanian Ouguiya
        '480' => 'MUR', // Mauritian Rupee
        '462' => 'MVR', // Maldivian Rufiyaa
        '454' => 'MWK', // Malawian Kwacha
        '484' => 'MXN', // Mexican Peso
        '943' => 'MXV', // Mexican Unidad de Inversion (UDI)
        '608' => 'NAD', // Namibian Dollar
        '578' => 'NIO', // Nicaraguan Córdoba
        '566' => 'NGN', // Nigerian Naira
        '512' => 'OMR', // Omani Rial
        '590' => 'PAB', // Panamanian Balboa
        '604' => 'PEN', // Peruvian Nuevo Sol
        '586' => 'PKR', // Pakistani Rupee
        '985' => 'PLN', // Polish Złoty
        '600' => 'PYG', // Paraguayan Guarani
        '634' => 'QAR', // Qatari Riyal
        '946' => 'RON', // Romanian Leu
        '643' => 'RUB', // Russian Ruble
        '646' => 'RWF', // Rwandan Franc
        '682' => 'SAR', // Saudi Riyal
        '090' => 'SBD', // Solomon Islands Dollar
        '690' => 'SCR', // Seychellois Rupee
        '938' => 'SDG', // Sudanese Pound
        '752' => 'SEK', // Swedish Krona
        '702' => 'SGD', // Singapore Dollar
        '654' => 'SHP', // Saint Helena Pound
        '694' => 'SLL', // Sierra Leonean Leone
        '706' => 'SOS', // Somali Shilling
        '834' => 'TZS', // Tanzanian Shilling
        '764' => 'THB', // Thai Baht
        '788' => 'TND', // Tunisian Dinar
        '949' => 'TRY', // Turkish Lira
        '934' => 'TMT', // Turkmenistan Manat
        '800' => 'UGX', // Ugandan Shilling
        '980' => 'UAH', // Ukrainian Hryvnia
        '784' => 'AED', // United Arab Emirates Dirham
        '840' => 'USD', // United States Dollar
        '997' => 'USN', // United States Dollar (Next day)
        '858' => 'UYU', // Uruguayan Peso
        '940' => 'UYW', // Uruguayan Nominal Wage Index Unit
        '860' => 'UZS', // Uzbekistan Som
        '937' => 'VES', // Venezuelan Bolívar
        '704' => 'VND', // Vietnamese Dong
        '548' => 'VUV', // Vanuatu Vatu
        '886' => 'YER', // Yemeni Rial
        '710' => 'ZAR', // South African Rand
        '967' => 'ZMW', // Zambian Kwacha
        '932' => 'ZWL', // Zimbabwean Dollar
    ];

    public static function getCodeByNumber(string $number): ?string
    {
        return self::NUMBER_TO_CODE[$number] ?? null;
    }
}