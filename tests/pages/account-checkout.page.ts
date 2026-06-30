import { expect, type Locator, type Page } from '@playwright/test';

export type AccountPaymentMethod = 'card' | 'crypto';

export class AccountCheckoutPage {
  readonly page: Page;
  private readonly emailInput: Locator;
  private readonly nextButton: Locator;
  private readonly submitButton: Locator;
  private readonly totalPrice: Locator;
  private readonly paymentMethods: Record<AccountPaymentMethod, Locator>;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('order-email-input');
    this.nextButton = page.getByTestId('order-login-submit-button');
    this.submitButton = page.getByTestId('order-payment-submit-button');
    this.totalPrice = page.getByTestId('order-total-price');
    this.paymentMethods = {
      card: page.getByTestId('order-payment-method-world'),
      crypto: page.getByTestId('order-payment-method-btc_heleket'),
    };
  }

  async gotoOrder() {
    await this.page.goto('/order/');
    await expect(this.page).toHaveURL(/account\.freevpnplanet\.com\/order\/?$/);
    await expect(this.page.getByTestId('order-login-title')).toHaveText(/enter your e-mail/i);
    await expect(this.emailInput).toBeVisible();
  }

  async gotoLogin() {
    await this.page.goto('/login/');
    await expect(this.page).toHaveURL(/account\.freevpnplanet\.com\/login\/?$/);
    await expect(this.page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  }

  async openFromSignUp() {
    await this.page.getByRole('link', { name: /^sign up$/i }).click();
    await expect(this.page).toHaveURL(/account\.freevpnplanet\.com\/order\/?$/);
    await expect(this.page.getByTestId('order-login-title')).toHaveText(/enter your e-mail/i);
  }

  async passEmailStep(email: string) {
    await expect(this.nextButton).toBeDisabled();
    await this.emailInput.fill(email);
    await expect(this.emailInput).toHaveValue(email);
    await expect(this.nextButton).toBeEnabled();

    await this.nextButton.click();
    await expect(this.page.getByTestId('order-payment-root')).toBeVisible();
    await expect(this.page.getByTestId('order-summary-root')).toBeVisible();
  }

  async selectPaymentMethod(method: AccountPaymentMethod) {
    const paymentMethod = this.paymentMethods[method];

    await paymentMethod.click();
    await this.expectPaymentMethodSelected(method);
    await expect(this.submitButton).toBeEnabled();
  }

  async expectPaymentMethodsVisible() {
    await expect(this.page.getByTestId('order-payment-title')).toHaveText(/select your payment method/i);
    await expect(this.paymentMethods.card).toContainText(/credit card/i);
    await expect(this.paymentMethods.crypto).toContainText(/cryptocurrency/i);
  }

  async expectPaymentMethodSelected(method: AccountPaymentMethod) {
    await expect(this.paymentMethods[method]).toHaveClass(/payment-method--active/);
  }

  async expectCryptoAgeBadgeVisible() {
    await expect(this.paymentMethods.crypto).toContainText(/16\+/i);
  }

  async expectEnteredEmail(email: string) {
    await expect(this.emailInput).toHaveValue(email);
  }

  async expectLegalLinksVisible() {
    await expect(this.page.getByTestId('order-payment-terms-link')).toHaveAttribute('href', /\/terms\/?$/);
    await expect(this.page.getByTestId('order-payment-policy-link')).toHaveAttribute('href', /\/policy\/?$/);
  }

  async expectOrderSummaryVisible() {
    await expect(this.page.getByTestId('order-summary-title')).toHaveText(/order summary/i);
    await expect(this.page.getByTestId('order-currency-select-current')).toContainText(/usd/i);
    await expect(this.page.getByTestId('order-plan-select-current')).toContainText(/1 year/i);
    await expect(this.totalPrice).toHaveText(/\$\d/);
    await expect(this.submitButton).toBeEnabled();
  }

  async readTotal(): Promise<string> {
    await expect(this.totalPrice).toHaveText(/\$\d/);
    return (await this.totalPrice.innerText()).trim();
  }

  async submitSubscription() {
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }

  async expectStripeCheckout(email: string, total: string) {
    await expect(this.page).toHaveURL(/checkout\.stripe\.com\/c\/pay\/cs_live_/, { timeout: 60_000 });
    await expect(this.page).toHaveTitle(/Planet VPN/i);
    await expect(this.page.getByText(email)).toBeVisible();
    await expect(this.page.getByText(total)).toBeVisible();
    await expect(this.page.getByText(/payment for order/i)).toBeVisible();
  }

  async expectCryptoCheckout(total: string) {
    await expect(this.page).toHaveURL(/new-pay\.heleket\.com\/pay\//, { timeout: 60_000 });
    await expect(this.page).toHaveTitle(/Heleket Pay/i);
    await expect(this.page.getByText(`${total.replace('$', '')} USD`)).toBeVisible();
    await expect(this.page.getByText(/select currency/i).first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: /proceed to payment/i })).toBeVisible();
  }
}
