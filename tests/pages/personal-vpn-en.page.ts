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
  private readonly subscriptionForm: Locator;
  private readonly paymentMethodForm: Locator;
  private readonly planOptions: Record<PersonalPlan, Locator>;
  private readonly planRadios: Record<PersonalPlan, Locator>;
  private readonly defaultLocationRadio: Locator;
  private readonly defaultCurrencyRadio: Locator;
  private readonly defaultPlanRadio: Locator;
  private readonly gatewayOptionLabels: Record<PaymentGateway, Locator>;
  private readonly gatewayRadios: Record<PaymentGateway, Locator>;
  private readonly termsCheckbox: Locator;
  private readonly termsOption: Locator;
  private readonly termsLink: Locator;
  private readonly refundPolicyLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.subscriptionForm = page.locator('#PPG');
    this.paymentMethodForm = page.locator('form[name="PPG"]');
    this.heroHeading = page.getByRole('heading', { name: /your personal vpn/i });
    this.emailInput = this.subscriptionForm.getByPlaceholder('name@example.com');
    this.firstStepPayButton = this.subscriptionForm.getByRole('button').filter({ hasText: /^pay$/i });
    this.finalPayButton = this.paymentMethodForm.getByRole('button').filter({ hasText: /^pay$/i });
    this.planOptions = {
      '1_month': this.subscriptionForm.locator('label.radio', { hasText: planLabels['1_month'] }),
      '1_year': this.subscriptionForm.locator('label.radio', { hasText: planLabels['1_year'] }),
    };
    this.planRadios = {
      '1_month': this.subscriptionForm.getByRole('radio', { name: /1 month/i }),
      '1_year': this.subscriptionForm.getByRole('radio', { name: /1 year/i }),
    };
    this.defaultLocationRadio = this.subscriptionForm.getByRole('radio', { name: /netherlands/i });
    this.defaultCurrencyRadio = this.subscriptionForm.getByRole('radio', { name: /^usd$/i });
    this.defaultPlanRadio = this.subscriptionForm.getByRole('radio', { name: /^2 days/i });
    this.gatewayOptionLabels = {
      stripe: this.paymentMethodForm.locator('label', { hasText: gatewayLabels.stripe }),
      crypto: this.paymentMethodForm.locator('label', { hasText: gatewayLabels.crypto }),
    };
    this.gatewayRadios = {
      stripe: this.paymentMethodForm.getByRole('radio', { name: /credit card/i }),
      crypto: this.paymentMethodForm.getByRole('radio', { name: /cryptocurrency/i }),
    };
    this.termsCheckbox = this.paymentMethodForm.getByRole('checkbox', { name: /by clicking this button/i });
    this.termsOption = this.paymentMethodForm.locator('label', { hasText: /by clicking this button/i });
    this.termsLink = this.paymentMethodForm.getByRole('link', { name: /terms of use/i });
    this.refundPolicyLink = this.paymentMethodForm.getByRole('link', { name: /refund policy/i });
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page).toHaveURL(/personal\.freevpnplanet\.com\/?$/);
    await expect(this.heroHeading).toBeVisible();
  }

  async expectDefaultOptionsVisible() {
    await expect(this.page.getByText(/choose the server location/i)).toBeVisible();
    await expect(this.defaultLocationRadio).toBeChecked();
    await expect(this.page.getByText(/choose a currency/i)).toBeVisible();
    await expect(this.defaultCurrencyRadio).toBeChecked();
    await expect(this.page.getByText(/choose the plan/i)).toBeVisible();
    await expect(this.defaultPlanRadio).toBeChecked();
    await expect(this.planOptions['1_month']).toBeVisible();
    await expect(this.planOptions['1_year']).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.firstStepPayButton).toBeVisible();
  }

  async selectPlan(plan: PersonalPlan) {
    await this.planOptions[plan].click();
    await expect(this.planRadios[plan]).toBeChecked();
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
    await expect(this.emailInput).toHaveValue(email);
  }

  async expectDefaultLocationAndCurrencySelected() {
    await expect(this.defaultLocationRadio).toBeChecked();
    await expect(this.defaultCurrencyRadio).toBeChecked();
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
    await expect(this.gatewayOptionLabels.stripe).toBeVisible();
    await expect(this.gatewayOptionLabels.crypto).toBeVisible();
    await expect(this.gatewayRadios.stripe).toBeChecked();
    await expect(this.gatewayRadios.crypto).not.toBeChecked();
    await expect(this.finalPayButton).toBeVisible();
  }

  async selectGateway(gateway: PaymentGateway) {
    await this.gatewayOptionLabels[gateway].click();
    await expect(this.gatewayRadios[gateway]).toBeChecked();
  }

  async expectTermsControlsVisible() {
    await expect(this.termsOption).toBeVisible();
    await expect(this.termsCheckbox).not.toBeChecked();
    await expect(this.termsLink).toHaveAttribute('href', /\/terms\/?$/);
    await expect(this.refundPolicyLink).toHaveAttribute('href', /\/refund\/?$/);
    await expect(this.finalPayButton).toBeEnabled();
  }

  async acceptTerms() {
    await this.termsOption.click();
    await expect(this.termsCheckbox).toBeChecked();
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
