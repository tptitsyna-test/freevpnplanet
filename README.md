# freevpnplanet
Playwright e2e tests

## Реализованные тесты

- Sign Up: реализовано для `Credit Card` сквозным сценарием из `freevpnplanet.com`: `Log In` -> `Sign Up` -> email -> `Next` -> payment method -> `Get your subscription` -> внешний Stripe checkout. Дополнительно в `account-checkout` реализованы проверки `Credit Card` и `Cryptocurrency`, включая внешние ссылки Stripe и Heleket.
- Personal VPN RU: не реализовано полностью. Домен `https://planetconfig.com/` не резолвится из тестового окружения, тест помечен как `fixme`.
- Personal VPN EN: реализовано до внутренней страницы выбора способа оплаты. Реализован выбор планов `1 month` и `1 year`, переход на `/payment/`, проверка query params, выбор `Credit Card` и `Cryptocurrency`. Финальная кнопка `Pay` нажимается в defect-check сценариях; продукт редиректит на `/p
- Для кросс-браузерности добавлены пары проектов Chrome/Safari: `marketing-chrome`, `marketing-safari`, `account-checkout-chrome`, `account-checkout-safari`, `personal-en-chrome`, `personal-en-safari`, `personal-ru-chrome`, `personal-ru-safari` - и можно легко добавить еще браузеры в текущую структуру.

## Реализованные проверки

`marketing`: 
- переход с `https://freevpnplanet.com/` по `Log In` на account domain.
- проверка страницы логина `https://account.freevpnplanet.com/login/`.
- переход со страницы логина по `Sign Up` на `https://account.freevpnplanet.com/order/`.
- заполнение email, выбор `Credit Card`, нажатие `Get your subscription` и проверка внешней Stripe checkout страницы.
- сумма на Stripe сверяется с суммой, предварительно прочитанной из order summary.

`account-checkout`: 
- переход со страницы логина по `Sign Up`, заполнение email и выбор `Credit Card`.
- переход со страницы логина по `Sign Up`, заполнение email и выбор `Cryptocurrency`.
- начальное состояние email-step: поле email и disabled `Next`.
- после заполнения email кнопка `Next` становится enabled.
- после `Next` отображаются payment-step и order summary.
- наличие выбора способа оплаты, валюты, плана, total и кнопки `Get your subscription`.
- выбор `Credit Card` и проверка активного метода.
- выбор `Cryptocurrency` и проверка активного метода.
- сохранение email при переключении payment method.
- внешние Stripe/Heleket страницы сверяются с суммой, предварительно прочитанной из order summary.

`personal-en`: 
- наличие дефолтных настроек Personal VPN EN: location, currency, планы, email и `Pay`.
- выбор плана `1 month`, заполнение email и переход на `/payment/`.
- выбор плана `1 year`, заполнение email и переход на `/payment/`.
- проверка, что на `/payment/` сохранены выбранные `offer_id` и email в URL.
- выбор `Credit Card` на странице выбора способа оплаты.
- выбор `Cryptocurrency` на странице выбора способа оплаты.

`personal-ru`: 
- сценарий добавлен как `fixme` до подтверждения рабочего RU-домена.

## Вопросы

- Является ли `https://planetconfig.com/` актуальным RU-доменом для покупки персонального VPN ?
- Для account checkout фактический путь `Sign Up` ведет на `/order/`, а не на отдельную страницу регистрации. Нужно подтвердить, что это ожидаемое поведение.
- Ссылка `Log In` с marketing site может вести на `https://account.freevpnplanet.com/`, а не сразу на `/login/`. Нужно подтвердить, должен ли account root редиректить на login.
- Финальная кнопка `Pay` на Personal VPN `/payment/` редиректит на `/payment/failed/`; В данный момент допускаю что это ожидаемое падение.

## Дефекты

- RU-домен `https://planetconfig.com/` не резолвился при ревью.
- `Log In` на marketing site не всегда приводит сразу на `/login/`; часто на  `https://account.freevpnplanet.com/`.

## Рекомендации

- Добавить тестовые/sandbox payment endpoints или test mode, чтобы можно было безопасно проверять генерацию payment URL без production side effects.
- Добавить `data-test-id` для Personal VPN формы.
- Personal VPN EN: добавить доступные имена или `data-test-id` для формы `#PPG`, чтобы не привязываться к CSS id.
- Personal VPN EN: добавить `data-test-id` для карточек планов `2 days`, `1 month`, `1 year`; сейчас выбор кликается по `label.radio` с текстом.
- Personal VPN EN: добавить явный label для email input, например `Your mail`, связанный через `for/id`
- Personal VPN EN payment page: добавить `data-test-id` или нормальные accessible labels для payment method карточек `Credit Card` и `Cryptocurrency`.
- Personal VPN EN payment page: добавить доступный checkbox label для terms agreement, связанный с hidden checkbox; сейчас приходится кликать кастомный `label` по тексту.
- Personal VPN EN payment page: добавить `data-test-id` для final `Pay` button и для hidden state inputs `gateway`, `offer_id`, `currency_code`, `location`, если их значения являются частью бизнес-проверок
- Account checkout: добавить semantic selected state (`aria-pressed` или `aria-checked`) для payment method buttons вместо проверки CSS class `payment-method--active`.
- Account checkout: cookie accept button иногда видим, но перекрывается layout; стоит поправить z-index/position или скрывать popup корректно после acceptance.


## Setup

```bash
npm install
npx playwright install chromium webkit
```
    
## Run

```bash
npm test
```
