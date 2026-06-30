import { expect, type Locator, type Page } from '@playwright/test';
import { uniqueEmail } from '../helpers/test-data';

export type PersonalPlan = '1_month' | '1_year';
export type PaymentGateway = 'stripe' | 'crypto';

const planLabels: Record<PersonalPlan, RegExp> = {
  '1_month': /1 month/i,
  '1_year': /1 year/i,
};

const gatewayLabels: Record<PaymentGateway, RegExp> = {
  stripe: /credit card/i,
  crypto: /cryptocurrency/i,
};

const externalPaymentUrls: Record<PaymentGateway, RegExp> = {
  stripe: /checkout\.stripe\.com\/c\/pay\//,
  crypto: /new-pay\.heleket\.com\/pay\//,
};

export class PersonalVpnEnPage {
  private readonly page: Page;
  private readonly heroHeading: Locator;
  private readonly emailInput: Locator;
  private readonly firstStepPayButton: Locator;
  private readonly finalPayButton: Locator;
  private readonly personalForm: Locator;
  private readonly paymentForm: Locator;
  private readonly planOptions: Record<PersonalPlan, Locator>;
  private readonly planInputs: Record<PersonalPlan, Locator>;
  private readonly defaultLocationInput: Locator;
  private readonly defaultCurrencyInput: Locator;
  private readonly defaultPlanInput: Locator;
  private readonly gatewayOptions: Record<PaymentGateway, Locator>;
  private readonly gatewayInputs: Record<PaymentGateway, Locator>;
  private readonly termsInput: Locator;
  private readonly termsOption: Locator;
  private readonly termsLink: Locator;
  private readonly refundPolicyLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.personalForm = page.locator('#PPG');
    this.paymentForm = page.locator('form[name="PPG"]');
    this.heroHeading = page.getByRole('heading', { name: /your personal vpn/i });
    this.emailInput = this.personalForm.getByPlaceholder('name@example.com');
    this.firstStepPayButton = this.personalForm.locator('button[type="submit"]');
    this.finalPayButton = this.paymentForm.locator('button[type="submit"]');
    this.planOptions = {
      '1_month': this.personalForm.locator('label.radio', { hasText: planLabels['1_month'] }),
      '1_year': this.personalForm.locator('label.radio', { hasText: planLabels['1_year'] }),
    };
    this.planInputs = {
      '1_month': this.personalForm.locator('input[name="offer_id"][value="1_month"]'),
      '1_year': this.personalForm.locator('input[name="offer_id"][value="1_year"]'),
    };
    this.defaultLocationInput = this.personalForm.locator('input[name="location"][value="NL"]');
    this.defaultCurrencyInput = this.personalForm.locator('input[name="currency_code"][value="USD"]');
    this.defaultPlanInput = this.personalForm.locator('input[name="offer_id"][value="2_days"]');
    this.gatewayOptions = {
      stripe: this.paymentForm.locator('label', { hasText: gatewayLabels.stripe }),
      crypto: this.paymentForm.locator('label', { hasText: gatewayLabels.crypto }),
    };
    this.gatewayInputs = {
      stripe: this.paymentForm.locator('input[name="gateway"][value="stripe"]'),
      crypto: this.paymentForm.locator('input[name="gateway"][value="crypto"]'),
    };
    this.termsInput = this.paymentForm.locator('input[name="terms"]');
    this.termsOption = this.paymentForm.locator('label', { hasText: /by clicking this button/i });
    this.termsLink = this.paymentForm.locator('a', { hasText: /terms of use/i });
    this.refundPolicyLink = this.paymentForm.locator('a', { hasText: /refund policy/i });
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page).toHaveURL(/personal\.freevpnplanet\.com\/?$/);
    await expect(this.heroHeading).toBeVisible();
  }

  async expectDefaultOptionsVisible() {
    await expect(this.page.getByText(/choose the server location/i)).toBeVisible();
    await expect(this.defaultLocationInput).toBeChecked();
    await expect(this.page.getByText(/choose a currency/i)).toBeVisible();
    await expect(this.defaultCurrencyInput).toBeChecked();
    await expect(this.page.getByText(/choose the plan/i)).toBeVisible();
    await expect(this.defaultPlanInput).toBeChecked();
    await expect(this.planOptions['1_month']).toBeVisible();
    await expect(this.planOptions['1_year']).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.firstStepPayButton).toBeVisible();
  }

  async selectPlan(plan: PersonalPlan) {
    await this.planOptions[plan].click();
    await expect(this.planInputs[plan]).toBeChecked();
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
    await expect(this.emailInput).toHaveValue(email);
  }

  async expectDefaultLocationAndCurrencySelected() {
    await expect(this.defaultLocationInput).toBeChecked();
    await expect(this.defaultCurrencyInput).toBeChecked();
  }

  async continueToPaymentMethods(plan: PersonalPlan, email: string) {
    await expect(this.firstStepPayButton).toBeEnabled();
    await this.firstStepPayButton.click();
    await expect(this.page).toHaveURL(/\/payment\/\?/);
    await expect(this.page).toHaveURL(new RegExp(`offer_id=${plan}`));
    await expect(this.page).toHaveURL(new RegExp(`email=${encodeURIComponent(email)}`));
    await expect(this.page.getByText(/choose payment method/i)).toBeVisible();
  }

  async completePlanStep(plan: PersonalPlan = '1_month') {
    const email = uniqueEmail(`personal.en.${plan}`);
    await this.selectPlan(plan);
    await this.fillEmail(email);
    await this.expectDefaultLocationAndCurrencySelected();
    await this.continueToPaymentMethods(plan, email);
    return email;
  }

  async expectPaymentMethodsVisible() {
    await expect(this.gatewayOptions.stripe).toBeVisible();
    await expect(this.gatewayOptions.crypto).toBeVisible();
    await expect(this.gatewayInputs.stripe).toBeChecked();
    await expect(this.gatewayInputs.crypto).not.toBeChecked();
    await expect(this.finalPayButton).toBeVisible();
  }

  async selectGateway(gateway: PaymentGateway) {
    await this.gatewayOptions[gateway].click();
    await expect(this.gatewayInputs[gateway]).toBeChecked();
  }

  async expectTermsControlsVisible() {
    await expect(this.termsOption).toBeVisible();
    await expect(this.termsInput).not.toBeChecked();
    await expect(this.termsLink).toHaveAttribute('href', /\/terms\/?$/);
    await expect(this.refundPolicyLink).toHaveAttribute('href', /\/refund\/?$/);
    await expect(this.finalPayButton).toBeEnabled();
  }

  async acceptTerms() {
    await this.termsOption.click();
    await expect(this.termsInput).toBeChecked();
  }

  async submitFinalPayment() {
    await expect(this.finalPayButton).toBeEnabled();
    await this.finalPayButton.click();
  }

  async expectExternalPaymentPage(gateway: PaymentGateway) {
    await expect(this.page).not.toHaveURL(/\/payment\/failed\/?$/);
    await expect(this.page).toHaveURL(externalPaymentUrls[gateway], { timeout: 15_000 });
  }
}
