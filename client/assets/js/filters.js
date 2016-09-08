App
    // фильтр по свойству 'active'
    .filter('filterActive', function () {
        return function (data) {
            return data.filter(function (obj) {
                return obj.active;
            });
        }
    })
    // фильтр по свойству 'income'
    .filter('filterIncome', function () {
        return function (data) {
            return data.filter(function (obj) {
                return obj.income;
            });
        }
    })
    // фильтр по свойству 'expense'
    .filter('filterExpense', function () {
        return function (data) {
            return data.filter(function (obj) {
                return obj.expense;
            });
        }
    });
